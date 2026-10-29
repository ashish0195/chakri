#!/bin/sh
# Renders the link preview (og.jpg, 1200 × 630) and the home screen icon (apple-touch-icon.png,
# 180 × 180) from tools/og.html and tools/touch-icon.html with headless Chrome. The preview is a
# JPEG because WhatsApp drops link previews whose image is over about 300 KB.
# Serve the folder first: npm run serve (port 8642).
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="http://localhost:${PORT:-8642}/tools"
render() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$2" --virtual-time-budget=3000 --screenshot="$PWD/$3" "$URL/$1" 2>/dev/null
  echo "Wrote $3"
}
render og.html 1200,630 og.png
sips -s format jpeg -s formatOptions 82 og.png --out og.jpg >/dev/null && rm og.png
echo "Wrote og.jpg"
render touch-icon.html 180,180 apple-touch-icon.png
