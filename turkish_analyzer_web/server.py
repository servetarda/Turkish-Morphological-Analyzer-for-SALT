import http.server
import socketserver
import subprocess
import os
import tempfile
import json
import logging

PORT = 8000
WHISPER_CMD = "/Library/Frameworks/Python.framework/Versions/3.14/bin/whisper"

logging.basicConfig(level=logging.INFO)

class WhisperHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/transcribe':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"No content")
                return

            audio_bytes = self.rfile.read(content_length)

            with tempfile.TemporaryDirectory() as tmpdir:
                audio_path = os.path.join(tmpdir, "audio.webm")
                with open(audio_path, 'wb') as f:
                    f.write(audio_bytes)

                logging.info(f"Saved audio to {audio_path}, running whisper...")

                try:
                    result = subprocess.run([
                        "python3", "-m", "whisper",
                        audio_path,
                        "--model", "base",
                        "--language", "tr",
                        "--output_format", "txt",
                        "--output_dir", tmpdir
                    ], capture_output=True, text=True, check=True)
                    
                    txt_path = os.path.join(tmpdir, "audio.txt")
                    if os.path.exists(txt_path):
                        with open(txt_path, 'r', encoding='utf-8') as f:
                            transcript = f.read()
                    else:
                        transcript = "Error: Transcript file not generated."

                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"transcript": transcript.strip()}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                    logging.info("Successfully transcribed audio.")

                except subprocess.CalledProcessError as e:
                    logging.error(f"Whisper failed: {e.stderr}")
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b"Whisper processing failed.")
                except FileNotFoundError:
                    logging.error(f"Command not found: {WHISPER_CMD} or missing ffmpeg")
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b"Whisper command or ffmpeg not found.")
        else:
            self.send_response(404)
            self.end_headers()

Handler = WhisperHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
