Add-Type -AssemblyName System.Drawing

$targetSize = 256
$muscleFiles = @(
    "muscle_chest.png",
    "muscle_triceps.png",
    "muscle_biceps.png",
    "muscle_back.png",
    "muscle_legs.png",
    "muscle_shoulders_v2.png"
)

$dir = "c:\Users\Haisal\Documents\workout-journal\assets\images"

Write-Host "=== COMPRESSING HOMEPAGE NEON MUSCLE ASSETS (Target: ${targetSize}x${targetSize} 32bpp PNG) ==="

$totalOld = 0
$totalNew = 0

foreach ($fileName in $muscleFiles) {
    $fullPath = Join-Path $dir $fileName
    if (-not (Test-Path $fullPath)) { continue }

    $oldLen = (Get-Item $fullPath).Length
    $totalOld += $oldLen

    $src = [System.Drawing.Bitmap]::FromFile($fullPath)
    $dst = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $targetSize, $targetSize)
    
    $g.Dispose()
    $src.Dispose()

    $tempSave = $fullPath + ".tmp.png"
    $dst.Save($tempSave, [System.Drawing.Imaging.ImageFormat]::Png)
    $dst.Dispose()

    Move-Item -Path $tempSave -Destination $fullPath -Force

    $newLen = (Get-Item $fullPath).Length
    $totalNew += $newLen

    $savingsPct = [int]((1.0 - ($newLen / $oldLen)) * 100)
    Write-Host ("{0,-24} | Before: {1,5} KB -> After: {2,4} KB ({3}% reduction)" -f $fileName, [int]($oldLen/1024), [int]($newLen/1024), $savingsPct)
}

Write-Host "----------------------------------------------------------------------------------"
Write-Host ("TOTAL BUNDLE WEIGHT     | Before: {0,5} KB -> After: {1,4} KB ({2}% reduction)" -f [int]($totalOld/1024), [int]($totalNew/1024), [int]((1.0 - ($totalNew/$totalOld))*100))
