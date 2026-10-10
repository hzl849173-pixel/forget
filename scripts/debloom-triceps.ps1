Add-Type -AssemblyName System.Drawing

$tricepFiles = @(
    "single-arm-pushdown.jpg",
    "cable-vbar-pushdown.jpg",
    "cable-overhead-ext.jpg",
    "db-kickbacks.jpg",
    "diamond-pushups.jpg",
    "weighted-dips.jpg",
    "overhead-db-extension.jpg",
    "cable-kickback.jpg",
    "tricep-dip-machine.jpg",
    "rope-pushdown.jpg",
    "close-grip-pushups.jpg",
    "cable-rope-overhead.jpg",
    "two-arm-db-overhead-ext.jpg",
    "bb-overhead-ext.jpg",
    "rev-grip-pushdown.jpg",
    "skull-crushers.jpg",
    "bench-dips.jpg",
    "close-grip-bench.jpg",
    "db-skull-crushers.jpg",
    "ez-bar-skull-crusher.jpg",
    "ez-bar-french-press.jpg",
    "straight-bar-pushdown.jpg"
)

function Debloom-ExerciseImage($filePath) {
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

            # Only target neutral background pixels with excess white bloom (Lum > 241)
            if ($sat -le 10 -and $lum -gt 241.0) {
                # Weight based on saturation (1.0 for neutral gray, 0.0 for saturated colors)
                $wSat = [Math]::Cos(($sat / 10.0) * ([Math]::PI / 2.0))

                # Smoothly compress [241, 255] down to [241, 242.5]
                $t = ($lum - 241.0) / (255.0 - 241.0)
                $targetL = 241.0 + $t * 1.5 # stays between 241 and 242.5
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

    # Save with 88% JPEG quality
    $tempSave = $filePath + ".tmp.jpg"
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)

    $outBmp.Save($tempSave, $codec, $encoderParams)
    $outBmp.Dispose()

    Move-Item -Path $tempSave -Destination $filePath -Force
    $fileName = Split-Path $filePath -Leaf
    Write-Host ("{0,-28} | Blown-out white pixels debloomed: {1}" -f $fileName, $countAffected)
}

$dir = "c:\Users\Haisal\Documents\workout-journal\assets\exercises"

Write-Host "=== DEBLOOMING TRICEP EXERCISES ==="
foreach ($name in $tricepFiles) {
    $path = Join-Path $dir $name
    if (Test-Path $path) {
        Debloom-ExerciseImage $path
    }
}
Write-Host "`nAll Tricep exercises successfully debloomed to uniform studio gray!"
