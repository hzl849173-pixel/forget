Add-Type -AssemblyName System.Drawing

function Get-TrueBackgroundChannels($bmp) {
    $w = $bmp.Width
    $h = $bmp.Height

    $rTL = @(); $gTL = @(); $bTL = @()
    $rTR = @(); $gTR = @(); $bTR = @()

    for ($x = 2; $x -le 16; $x++) {
        for ($y = 2; $y -le 16; $y++) {
            # Top-Left
            $pTL = $bmp.GetPixel($x, $y)
            $satTL = [Math]::Max($pTL.R, [Math]::Max($pTL.G, $pTL.B)) - [Math]::Min($pTL.R, [Math]::Min($pTL.G, $pTL.B))
            $lumTL = 0.299 * $pTL.R + 0.587 * $pTL.G + 0.114 * $pTL.B
            if ($satTL -le 12 -and $lumTL -ge 120) {
                $rTL += $pTL.R; $gTL += $pTL.G; $bTL += $pTL.B
            }

            # Top-Right
            $pTR = $bmp.GetPixel($w - 1 - $x, $y)
            $satTR = [Math]::Max($pTR.R, [Math]::Max($pTR.G, $pTR.B)) - [Math]::Min($pTR.R, [Math]::Min($pTR.G, $pTR.B))
            $lumTR = 0.299 * $pTR.R + 0.587 * $pTR.G + 0.114 * $pTR.B
            if ($satTR -le 12 -and $lumTR -ge 120) {
                $rTR += $pTR.R; $gTR += $pTR.G; $bTR += $pTR.B
            }
        }
    }

    $lumAvgTL = if ($rTL.Count -gt 0) { (0.299 * ($rTL | Measure-Object -Average).Average + 0.587 * ($gTL | Measure-Object -Average).Average + 0.114 * ($bTL | Measure-Object -Average).Average) } else { 0 }
    $lumAvgTR = if ($rTR.Count -gt 0) { (0.299 * ($rTR | Measure-Object -Average).Average + 0.587 * ($gTR | Measure-Object -Average).Average + 0.114 * ($bTR | Measure-Object -Average).Average) } else { 0 }

    # Pick the brighter neutral corner patch to avoid equipment frames
    if ($lumAvgTL -gt 0 -and $lumAvgTR -gt 0) {
        if (($lumAvgTL - $lumAvgTR) -gt 15) {
            return @{ R = ($rTL | Measure-Object -Average).Average; G = ($gTL | Measure-Object -Average).Average; B = ($bTL | Measure-Object -Average).Average; Lum = $lumAvgTL }
        }
        if (($lumAvgTR - $lumAvgTL) -gt 15) {
            return @{ R = ($rTR | Measure-Object -Average).Average; G = ($gTR | Measure-Object -Average).Average; B = ($bTR | Measure-Object -Average).Average; Lum = $lumAvgTR }
        }
        return @{
            R = (($rTL | Measure-Object -Average).Average + ($rTR | Measure-Object -Average).Average) / 2.0
            G = (($gTL | Measure-Object -Average).Average + ($gTR | Measure-Object -Average).Average) / 2.0
            B = (($bTL | Measure-Object -Average).Average + ($bTR | Measure-Object -Average).Average) / 2.0
            Lum = ($lumAvgTL + $lumAvgTR) / 2.0
        }
    }
    if ($lumAvgTL -gt 0) {
        return @{ R = ($rTL | Measure-Object -Average).Average; G = ($gTL | Measure-Object -Average).Average; B = ($bTL | Measure-Object -Average).Average; Lum = $lumAvgTL }
    }
    if ($lumAvgTR -gt 0) {
        return @{ R = ($rTR | Measure-Object -Average).Average; G = ($gTR | Measure-Object -Average).Average; B = ($bTR | Measure-Object -Average).Average; Lum = $lumAvgTR }
    }
    return @{ R = 241.0; G = 241.0; B = 241.0; Lum = 241.0 }
}

function Calibrate-Exercise($filePath, [double]$target = 241.0) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $bg = Get-TrueBackgroundChannels $bmp
    $deltaR = $target - $bg.R
    $deltaG = $target - $bg.G
    $deltaB = $target - $bg.B
    $deltaLum = $target - $bg.Lum

    if ([Math]::Abs($deltaR) -lt 1.0 -and [Math]::Abs($deltaG) -lt 1.0 -and [Math]::Abs($deltaB) -lt 1.0) {
        $bmp.Dispose()
        return $false
    }

    $fileName = Split-Path $filePath -Leaf
    Write-Host ("Calibrating {0,-26} | Current RGB: ({1,4:F1}, {2,4:F1}, {3,4:F1}) -> Target: {4:F1}" -f $fileName, $bg.R, $bg.G, $bg.B, $target)

    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $stride = $srcData.Stride
    $bytes = [byte[]]::new($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $bytes.Length)

    $minThresh = [Math]::Min($bg.Lum, $target) - 20.0
    $maxThresh = [Math]::Min($bg.Lum, $target)

    for ($y = 0; $y -lt $h; $y++) {
        $rowOffset = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $rowOffset + ($x * 4)
            $b = $bytes[$idx]
            $g = $bytes[$idx + 1]
            $r = $bytes[$idx + 2]

            # Saturation / color divergence (strictly protects muscles)
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
                $newR = [Math]::Min(255, [Math]::Max(0, [int]($r + $deltaR * $wFinal)))
                $newG = [Math]::Min(255, [Math]::Max(0, [int]($g + $deltaG * $wFinal)))
                $newB = [Math]::Min(255, [Math]::Max(0, [int]($b + $deltaB * $wFinal)))

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
Write-Host "=== RGB CHANNEL-ACCURATE CALIBRATION TO (241.0, 241.0, 241.0) ==="
foreach ($f in $files) {
    if (Calibrate-Exercise $f.FullName 241.0) {
        $count++
    }
}

Write-Host "`nSuccessfully calibrated $count exercise assets!"
