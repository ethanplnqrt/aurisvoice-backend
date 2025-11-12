#!/bin/bash

# AurisVoice Dubbing API Test Script
# Usage: ./test-dubbing.sh [audio-file.mp3] [target-language]

echo "🎙️ AurisVoice Dubbing API Test"
echo "================================"
echo ""

# Default values
FILE="${1:-test-audio.mp3}"
LANG="${2:-en}"
API_URL="http://localhost:3000"

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "❌ Error: File '$FILE' not found!"
    echo ""
    echo "Usage: ./test-dubbing.sh [audio-file.mp3] [target-language]"
    echo ""
    echo "Example:"
    echo "  ./test-dubbing.sh my-audio.mp3 fr"
    echo ""
    exit 1
fi

echo "📁 File: $FILE"
echo "🌍 Target Language: $LANG"
echo "🔗 API: $API_URL/api/dub"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "---------------------"
STATUS=$(curl -s "$API_URL/status")
echo "Response: $STATUS"
echo ""

# Test 2: Upload and Generate Dub
echo "Test 2: Generate Dub"
echo "--------------------"
echo "Uploading file and generating dub..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/dub" \
  -F "file=@$FILE" \
  -F "targetLanguage=$LANG" \
  -F "sourceLanguage=auto")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract audio URL
AUDIO_URL=$(echo "$RESPONSE" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$AUDIO_URL" ]; then
    echo "✅ Success! Audio generated at: $AUDIO_URL"
    echo ""
    echo "🎧 Full URL: $API_URL$AUDIO_URL"
    echo ""
    echo "To play in browser, open:"
    echo "  $API_URL$AUDIO_URL"
else
    echo "❌ Failed to generate dub"
fi

echo ""
echo "Test complete!"

