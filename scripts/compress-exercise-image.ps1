param(
    [string]$SourcePath,
    [string]$DestName,
    [int]$Size = 300
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile($SourcePath)
$destDir = "c:\Users\Haisal\Documents\workout-journal\assets\exercises"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$destPath = Join-Path $destDir ($DestName + ".jpg")

$bmp = New-Object System.Drawing.Bitmap($Size, $Size)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.DrawImage($src, 0, 0, $Size, $Size)

# Save as JPEG with 85% quality to get clean, crisp ~30-50KB images
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)

$bmp.Save($destPath, $codec, $encoderParams)

$src.Dispose()
$graphics.Dispose()
$bmp.Dispose()

$fileInfo = Get-Item $destPath
Write-Host "Created: $destPath (" ($fileInfo.Length / 1024).ToString("F1") "KB)"
