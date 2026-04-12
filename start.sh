# Ensure we are in the project root
cd /app

# 0. Runtime environment diagnostics (CRITICAL for debugging HF Spaces)
echo "========================================================"
echo "🔍 Runtime Environment Check"
echo "========================================================"
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ ERROR: NEXTAUTH_SECRET is NOT set! JWT will fail."
  echo "   → Go to your HF Space Settings → Variables and Secrets → Add NEXTAUTH_SECRET"
else
  echo "✅ NEXTAUTH_SECRET is set (length: ${#NEXTAUTH_SECRET} chars)"
fi
if [ -z "$DATABASE_URL" ]; then
  echo "❌ WARNING: DATABASE_URL is NOT set!"
else
  echo "✅ DATABASE_URL is set"
fi
if [ -n "$SPACE_ID" ]; then
    # Construct HF Space URL from SPACE_ID (e.g. "user/space" -> "https://user-space.hf.space")
    HF_OWNER=$(echo $SPACE_ID | cut -d/ -f1 | tr '[:upper:]' '[:lower:]')
    HF_NAME=$(echo $SPACE_ID | cut -d/ -f2 | tr '[:upper:]' '[:lower:]')
    HF_OWNER_CLEAN=$(echo $HF_OWNER | tr '_' '-' | tr '.' '-')
    HF_NAME_CLEAN=$(echo $HF_NAME | tr '_' '-' | tr '.' '-')
    export NEXTAUTH_URL="https://${HF_OWNER_CLEAN}-${HF_NAME_CLEAN}.hf.space"
    echo "🌐 Auto-detected Hugging Face URL (Forcing): $NEXTAUTH_URL"
elif [ -z "$NEXTAUTH_URL" ]; then
    echo "⚠️  NEXTAUTH_URL not set and not on HF Space, using local default..."
    export NEXTAUTH_URL="http://localhost:7860"
fi
echo "   NEXTAUTH_URL = $NEXTAUTH_URL"
echo "========================================================"

# 1. Download the ML model if missing
echo "--------------------------------------------------------"
echo "📦 Checking for ML Model Weights..."
echo "--------------------------------------------------------"
python download_model.py

# 1. Start the Flask Backend in the background
echo "--------------------------------------------------------"
# Ensure Python can find the Foodimg2Ing package
export PYTHONPATH=$PYTHONPATH:/app
# Start Flask bound specifically to 127.0.0.1 (IPv4) for bridge stability
python -u start_app.py &
BACKEND_PID=$!

# 2. Give the model enough time to load (PyTorch models on CPU take 45-60s)
echo "⏳ Waiting for ML engine to initialize (approx 60s)..."
sleep 60

# 3. Start the Next.js Frontend in the foreground
echo "--------------------------------------------------------"
echo "🚀 Starting CuisineAI Next.js Frontend on Port 7860..."
echo "--------------------------------------------------------"
cd frontend
# Hugging Face looks for port 7860 by default
npm start -- -p 7860

# 4. If Next.js exits, handle the cleanup
exit_code=$?
echo "⚠️ Frontend exited with code $exit_code. Cleaning up..."
kill $BACKEND_PID
exit $exit_code
