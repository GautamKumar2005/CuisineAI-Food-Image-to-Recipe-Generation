import sys
import os
import threading
import time
import urllib.request

# Ensure the parent directory is in the Python path so we can import Foodimg2Ing as a package
sys.path.append(os.path.dirname(__file__))

def keep_alive():
    url = "https://gkumar2005-cuisineai.hf.space/"
    while True:
        time.sleep(10800)  # Ping every 3 hours
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'KeepAliveBot/1.0'})
            urllib.request.urlopen(req)
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Auto-pinged {url} to keep server alive.")
        except Exception as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Keep-alive ping failed: {e}")

def main():
    print("=" * 50)
    print("    Food Image to Recipe Web Application")
    print("=" * 50)
    print("Starting Flask server...", flush=True)
    
    # Start the keep-alive background thread
    threading.Thread(target=keep_alive, daemon=True).start()
    
    try:
        print("Step 1: Pre-import check passed...", flush=True)
        print("Step 2: Loading Foodimg2Ing package (this can take 10-20s)...", flush=True)
        from Foodimg2Ing import app
        print("Step 3: Package loaded successfully.", flush=True)

        # Force use internal port 5000 to avoid conflict with Next.js on 7860
        port = 5000
        print(f"Step 4: Starting Flask server on 127.0.0.1:{port}...", flush=True)
        
        # Bind specifically to 127.0.0.1 (IPv4) for intra-container stability
        app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
        
    except ImportError as e:
        print(f"Error: Could not import Foodimg2Ing package. {e}")
    except Exception as e:
        print(f"Flask App Error: {e}")

if __name__ == "__main__":
    main()