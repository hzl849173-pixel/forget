Add-Type -AssemblyName System.Drawing

$dir = "c:\Users\Haisal\Documents\workout-journal\assets\exercises"
$files = Get-ChildItem -Path $dir -Filter "*.jpg"

Write-Host "Found $($files.Count) exercise images to process."

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)

foreach ($file in $files) {
    $srcPath = $file.FullName
    $img = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $img.Width
    $h = $img.Height

    # Create a new 32bpp bitmap
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    # We do a flood-fill from all 4 borders or luminance curve mapping
    # Let's inspect: background in studio renders is light grey / off-white vignette.
    # The figure/bench/weights are darker grey, metallic, or red-orange muscle.
    # If a pixel is very bright (e.g. R, G, B > 232 or brightness > 0.90 and low saturation), it's background!
    # When we remap high brightness values [230..255] to pure 255, the background becomes solid #FFFFFF!
    
    # We can use LockBits for high-performance pixel manipulation
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $bytesCount = [Math]::Abs($srcData.Stride) * $h
    $rgbValues = New-Object byte[] $bytesCount

    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $rgbValues, 0, $bytesCount)

    # Process pixels: Format32bppArgb is [B, G, R, A]
    for ($i = 0; $i -lt $bytesCount; $i += 4) {
        $b = $rgbValues[$i]
        $g = $rgbValues[$i + 1]
        $r = $rgbValues[$i + 2]

        # Calculate luminance and saturation
        $min = [Math]::Min($r, [Math]::Min($g, $b))
        $max = [Math]::Max($r, [Math]::Max($g, $b))
        $diff = $max - $min

        # If it's a near-neutral off-white / light gray studio background:
        # e.g., low color difference (diff < 22) and very light (min >= 225)
        # OR if min is extremely high (min >= 242)
        if (($min -ge 225 -and $diff -lt 22) -or ($min -ge 242)) {
            # Normalize to pure white
            $rgbValues[$i] = 255     # B
            $rgbValues[$i + 1] = 255 # G
            $rgbValues[$i + 2] = 255 # R
        } else {
            # Subtle smooth curve: if min >= 205 and diff < 16, gently brighten towards 255
            if ($min -ge 205 -and $diff -lt 16) {
                # Scale from [205..225] smoothly to [220..255]
                $factor = ($min - 205) / 20.0
                $val = [int]([Math]::Min(255, $min + (255 - $min) * $factor * 0.95))
                $rgbValues[$i] = [byte]$val
                $rgbValues[$i + 1] = [byte]$val
                $rgbValues[$i + 2] = [byte]$val
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $dstData.Scan0, $bytesCount)

    $img.UnlockBits($srcData)
    $bmp.UnlockBits($dstData)
    $img.Dispose()

    # Save cleaned bitmap
    $tempPath = $srcPath + ".tmp"
    $bmp.Save($tempPath, $codec, $encoderParams)
    $bmp.Dispose()

    # Replace original
    Move-Item -Path $tempPath -Destination $srcPath -Force
    Write-Host "Normalized: $($file.Name)"
}

Write-Host "All backgrounds normalized to pure #FFFFFF!"
