iOS — drop the ios/ PNGs into an AppIcon.appiconset (or assign by size in Xcode).
Android — copy mipmap-* files into res/, and upload play-store-512.png to Play Console.
PWA — android-chrome 192 and 512 also work as web app manifest icons.

Sizes are generated from your original. A source of at least 1024×1024 stays sharp on the App Store asset.
iOS icons are flattened onto your padding colour (white by default): Apple rejects app icons that contain transparency.
