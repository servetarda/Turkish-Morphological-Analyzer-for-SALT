#!/bin/bash
cd /Users/servetardakayhan/.gemini/antigravity/scratch/turkish_analyzer_web

# 1. Compile AppleScript to a Mac App locally first
cat << 'EOF' > launcher.scpt
tell application "Terminal"
    do script "echo '==============================================='; echo ' Starting Turkish Dil Analiz Aracı...'; echo ' Please do not close this window while using it.'; echo ' Close this window to stop the server.'; echo '==============================================='; cd /Users/servetardakayhan/.gemini/antigravity/scratch/turkish_analyzer_web && (sleep 1.5 && open http://localhost:8000 &) && python3 server.py"
    activate
end tell
EOF
osacompile -o "Turkish Analyzer.app" launcher.scpt
rm launcher.scpt

# 2. Generate macOS .icns file from the generated image
IMAGE_PATH="/Users/servetardakayhan/.gemini/antigravity/brain/f717c36f-48ab-4c18-8793-35904e5d7d51/turkish_analyzer_icon_1778014319374.png"
mkdir icon.iconset
sips -s format png -z 16 16 "$IMAGE_PATH" --out icon.iconset/icon_16x16.png
sips -s format png -z 32 32 "$IMAGE_PATH" --out icon.iconset/icon_16x16@2x.png
sips -s format png -z 32 32 "$IMAGE_PATH" --out icon.iconset/icon_32x32.png
sips -s format png -z 64 64 "$IMAGE_PATH" --out icon.iconset/icon_32x32@2x.png
sips -s format png -z 128 128 "$IMAGE_PATH" --out icon.iconset/icon_128x128.png
sips -s format png -z 256 256 "$IMAGE_PATH" --out icon.iconset/icon_128x128@2x.png
sips -s format png -z 256 256 "$IMAGE_PATH" --out icon.iconset/icon_256x256.png
sips -s format png -z 512 512 "$IMAGE_PATH" --out icon.iconset/icon_256x256@2x.png
sips -s format png -z 512 512 "$IMAGE_PATH" --out icon.iconset/icon_512x512.png
sips -s format png -z 1024 1024 "$IMAGE_PATH" --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset

# 3. Apply the icon to the app
cp icon.icns "Turkish Analyzer.app/Contents/Resources/applet.icns"
touch "Turkish Analyzer.app"

# 4. Clean up
rm -rf icon.iconset icon.icns
