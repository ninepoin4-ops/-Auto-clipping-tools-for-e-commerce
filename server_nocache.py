import http.server
import os
import socket
import socketserver
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _send_text(self, status: int, text: str) -> None:
        data = text.encode("utf-8", errors="replace")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/api/convert-mp4":
            self._send_text(404, "Not Found")
            return

        content_length = self.headers.get("Content-Length")
        if not content_length:
            self._send_text(400, "Missing Content-Length")
            return
        try:
            total = int(content_length)
        except ValueError:
            self._send_text(400, "Invalid Content-Length")
            return
        if total <= 0:
            self._send_text(400, "Empty body")
            return

        ffmpeg = self._find_ffmpeg()
        if not ffmpeg:
            self._send_text(501, "ffmpeg not found. Run 配置环境.bat to install runtime.")
            return

        try:
            with tempfile.TemporaryDirectory(prefix="beatcc_") as tmp:
                in_path = Path(tmp) / "input.webm"
                out_path = Path(tmp) / "output.mp4"
                with open(in_path, "wb") as f:
                    remaining = total
                    while remaining > 0:
                        chunk = self.rfile.read(min(1024 * 1024, remaining))
                        if not chunk:
                            break
                        f.write(chunk)
                        remaining -= len(chunk)

                if in_path.stat().st_size <= 0:
                    self._send_text(400, "Failed to read body")
                    return

                cmd = [
                    ffmpeg,
                    "-y",
                    "-i",
                    str(in_path),
                    "-c:v",
                    "libx264",
                    "-pix_fmt",
                    "yuv420p",
                    "-preset",
                    "veryfast",
                    "-crf",
                    "23",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "192k",
                    "-movflags",
                    "+faststart",
                    str(out_path),
                ]
                proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60 * 30)
                if proc.returncode != 0 or not out_path.exists() or out_path.stat().st_size <= 0:
                    err = proc.stderr.decode("utf-8", errors="replace")[-4000:]
                    self._send_text(500, "ffmpeg failed:\n" + err)
                    return

                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Disposition", 'attachment; filename="BeatCC.mp4"')
                self.send_header("Content-Length", str(out_path.stat().st_size))
                self.end_headers()
                with open(out_path, "rb") as f:
                    while True:
                        buf = f.read(1024 * 1024)
                        if not buf:
                            break
                        self.wfile.write(buf)
        except subprocess.TimeoutExpired:
            self._send_text(504, "ffmpeg timeout")
        except Exception as e:
            self._send_text(500, f"Server error: {e}")

    def _find_ffmpeg(self) -> Optional[str]:
        here = Path(__file__).resolve().parent
        bundled = here / "runtime" / "ffmpeg" / "ffmpeg.exe"
        if bundled.exists():
            return str(bundled)
        for p in os.environ.get("PATH", "").split(os.pathsep):
            candidate = Path(p) / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
            if candidate.exists():
                return str(candidate)
        return None


class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self) -> None:
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except OSError:
            pass
        super().server_bind()


def main() -> None:
    port = 8000
    if len(sys.argv) >= 2:
        port = int(sys.argv[1])
    try:
        with DualStackServer(("::", port), NoCacheHandler) as httpd:
            httpd.serve_forever()
    except OSError:
        with ThreadingHTTPServer(("", port), NoCacheHandler) as httpd:
            httpd.serve_forever()


if __name__ == "__main__":
    main()

