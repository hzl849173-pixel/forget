Add-Type -AssemblyName System.Drawing

function Debloom-Image($filePath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $stride = $srcData.Stride
    $bytes = [byte[]]::new($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $bytes.Length)

    $countAffected = 0
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

            # Luminance
            $lum = 0.299 * $r + 0.587 * $g + 0.114 * $b

            # Only target neutral background pixels with excess white bloom (Lum > 241.5)
            if ($sat -le 10 -and $lum -gt 241.5) {
                # Weight based on saturation (1.0 for neutral gray, 0.0 for saturated colors)
                $wSat = [Math]::Cos(($sat / 10.0) * ([Math]::PI / 2.0))

                # Smoothly compress [241.5, 255.0] down to [241.0, 242.5]
                $t = ($lum - 241.5) / (255.0 - 241.5)
                $targetL = 241.0 + $t * 1.5
                $targetFactor = $targetL / $lum

                # Blend factor
                $effectiveFactor = 1.0 - $wSat * (1.0 - $targetFactor)

                $newR = [Math]::Min(255, [Math]::Max(0, [int]($r * $effectiveFactor)))
                $newG = [Math]::Min(255, [Math]::Max(0, [int]($g * $effectiveFactor)))
                $newB = [Math]::Min(255, [Math]::Max(0, [int]($b * $effectiveFactor)))

                $bytes[$idx] = [byte]$newB
                $bytes[$idx + 1] = [byte]$newG
                $bytes[$idx + 2] = [byte]$newR
                $countAffected++
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $dstData.Scan0, $bytes.Length)
    $bmp.UnlockBits($srcData)
    $outBmp.UnlockBits($dstData)
    $bmp.Dispose()

    # If few pixels were affected, no need to overwrite
    if ($countAffected -lt 1000) {
        $outBmp.Dispose()
        return $false
    }

    # Save with 88% JPEG quality
    $tempSave = $filePath + ".tmp.jpg"
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)

    $outBmp.Save($tempSave, $codec, $encoderParams)
    $outBmp.Dispose()

    Move-Item -Path $tempSave -Destination $filePath -Force
    $fileName = Split-Path $filePath -Leaf
    Write-Host ("{0,-30} | Debloomed {1,5} white pixels" -f $fileName, $countAffected)
    return $true
}

$files = Get-ChildItem "assets/exercises/*.jpg"
$debloomedCount = 0

Write-Host "=== DEBLOOMING ALL EXERCISES WITH WHITE HALO ==="
foreach ($f in $files) {
    if (Debloom-Image $f.FullName) {
        $debloomedCount++
    }
}

Write-Host "`nSuccessfully debloomed $debloomedCount exercise assets to uniform studio gray!"
