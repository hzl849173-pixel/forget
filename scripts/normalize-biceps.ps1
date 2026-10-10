Add-Type -AssemblyName System.Drawing

function Get-TrueBackgroundLum($bmp) {
    $w = $bmp.Width
    $h = $bmp.Height

    # Sample top-left and top-right corner patches (15x15 pixels each)
    $lums = @()
    for ($x = 2; $x -le 16; $x++) {
        for ($y = 2; $y -le 16; $y++) {
            # Top-Left
            $pTL = $bmp.GetPixel($x, $y)
            $satTL = [Math]::Max($pTL.R, [Math]::Max($pTL.G, $pTL.B)) - [Math]::Min($pTL.R, [Math]::Min($pTL.G, $pTL.B))
            $lumTL = 0.299 * $pTL.R + 0.587 * $pTL.G + 0.114 * $pTL.B
            if ($satTL -le 4 -and $lumTL -ge 215) { $lums += $lumTL }

            # Top-Right
            $pTR = $bmp.GetPixel($w - 1 - $x, $y)
            $satTR = [Math]::Max($pTR.R, [Math]::Max($pTR.G, $pTR.B)) - [Math]::Min($pTR.R, [Math]::Min($pTR.G, $pTR.B))
            $lumTR = 0.299 * $pTR.R + 0.587 * $pTR.G + 0.114 * $pTR.B
            if ($satTR -le 4 -and $lumTR -ge 215) { $lums += $lumTR }
        }
    }

    if ($lums.Count -eq 0) { return 241.0 }
    return ($lums | Measure-Object -Average).Average
}

function Calibrate-Exercise($filePath, [double]$targetLum = 241.0) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $currentBg = Get-TrueBackgroundLum $bmp
    $delta = $targetLum - $currentBg

    if ([Math]::Abs($delta) -lt 2.5) {
        $bmp.Dispose()
        return $false
    }

    $fileName = Split-Path $filePath -Leaf
    Write-Host ("Calibrating {0,-26} | Current Bg: {1,5:F1} -> Target: {2} (Delta: {3,5:F1})" -f $fileName, $currentBg, $targetLum, $delta)

    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $stride = $srcData.Stride
    $bytes = [byte[]]::new($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $bytes.Length)

    $minThresh = [Math]::Min($currentBg, $targetLum) - 24.0
    $maxThresh = [Math]::Min($currentBg, $targetLum)

    for ($y = 0; $y -lt $h; $y++) {
        $rowOffset = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $rowOffset + ($x * 4)
            $b = $bytes[$idx]
            $g = $bytes[$idx + 1]
            $r = $bytes[$idx + 2]

            # Saturation / color divergence (keeps muscles untouched)
            $maxC = [Math]::Max($r, [Math]::Max($g, $b))
            $minC = [Math]::Min($r, [Math]::Min($g, $b))
            $sat = $maxC - $minC

            $wColor = 0.0
            if ($sat -le 10) {
                $wColor = [Math]::Cos(($sat / 10.0) * ([Math]::PI / 2.0))
            }

            # Luminance weight
            $lum = 0.299 * $r + 0.587 * $g + 0.114 * $b
            $wLum = 0.0
            if ($lum -ge $maxThresh) {
                $wLum = 1.0
            } elseif ($lum -gt $minThresh) {
                $t = ($lum - $minThresh) / ($maxThresh - $minThresh)
                $wLum = $t * $t * (3.0 - 2.0 * $t)
            }

            $wFinal = $wColor * $wLum

            if ($wFinal -gt 0.0) {
                $newR = [Math]::Min(255, [Math]::Max(0, [int]($r + $delta * $wFinal)))
                $newG = [Math]::Min(255, [Math]::Max(0, [int]($g + $delta * $wFinal)))
                $newB = [Math]::Min(255, [Math]::Max(0, [int]($b + $delta * $wFinal)))

                $bytes[$idx] = [byte]$newB
                $bytes[$idx + 1] = [byte]$newG
                $bytes[$idx + 2] = [byte]$newR
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $dstData.Scan0, $bytes.Length)
    $bmp.UnlockBits($srcData)
    $outBmp.UnlockBits($dstData)
    $bmp.Dispose()

    # Save with 88% JPEG quality
    $tempSave = $filePath + ".tmp.jpg"
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)

    $outBmp.Save($tempSave, $codec, $encoderParams)
    $outBmp.Dispose()

    Move-Item -Path $tempSave -Destination $filePath -Force
    return $true
}

$files = Get-ChildItem "assets/exercises/*.jpg"
$count = 0
foreach ($f in $files) {
    if (Calibrate-Exercise $f.FullName 241.0) {
        $count++
    }
}

Write-Host "`nSuccessfully calibrated $count exercise assets to exact RGB 241.0!"
