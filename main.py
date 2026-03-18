"""
Agent Zero Desktop Application
Wrapper for the Agent Zero framework with native desktop features.

Technology: Pyloid (Electron for Python)
"""

import os
import sys
import threading
import time
import subprocess
from pathlib import Path

from pyloid import Pyloid, Branches
from pyloid import PyloidWindow
from pyloid.tray import Tray
from pyloid.menu import Menu, MenuItem
from pyloid.notification import Notification


# Configuration
A0_PATH = Path("/a0")
DEFAULT_PORT = 5000
WINDOW_TITLE = "Agent Zero"
WINDOW_WIDTH = 1400
WINDOW_HEIGHT = 900


class AgentZeroApp:
    """Main desktop application wrapper for Agent Zero."""
    
    def __init__(self):
        self.app = None
        self.window = None
        self.a0_process = None
        self.port = DEFAULT_PORT
        
    def get_a0_port(self) -> int:
        """Get the port Agent Zero is running on from environment or config."""
        # Try to read from .env file
        env_file = A0_PATH / ".env"
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if line.startswith("WEB_UI_PORT="):
                        try:
                            return int(line.split("=")[1].strip())
                        except (ValueError, IndexError):
                            pass
        return DEFAULT_PORT
    
    def start_agent_zero(self):
        """Start the Agent Zero web server in a background thread."""
        def run_a0():
            # Change to Agent Zero directory and run
            os.chdir(str(A0_PATH))
            # Run the UI server
            subprocess.run([sys.executable, "run_ui.py"], cwd=str(A0_PATH))
        
        # Start in background thread
        thread = threading.Thread(target=run_a0, daemon=True)
        thread.start()
        
        # Wait for server to start
        print("Waiting for Agent Zero server to start...")
        time.sleep(5)
        
        # Check if server is running
        import socket
        for _ in range(30):  # 30 seconds timeout
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('127.0.0.1', self.port))
                sock.close()
                if result == 0:
                    print(f"Agent Zero server is running on port {self.port}")
                    return True
            except Exception:
                pass
            time.sleep(1)
        
        print("Warning: Agent Zero server may not be ready yet")
        return False
    
    def create_window(self) -> PyloidWindow:
        """Create the main application window."""
        url = f"http://127.0.0.1:{self.port}"
        
        window = self.app.create_window(
            title=WINDOW_TITLE,
            width=WINDOW_WIDTH,
            height=WINDOW_HEIGHT,
            min_width=800,
            min_height=600,
            url=url,
            devtools=True,  # Enable for development
            frameless=False,  # Use native window frame
            resizable=True,
        )
        
        # Set window properties
        window.set_title(WINDOW_TITLE)
        
        return window
    
    def create_tray(self):
        """Create system tray with menu."""
        tray_menu = Menu(
            items=[
                MenuItem("Show Window", on_click=self.show_window),
                MenuItem("Hide Window", on_click=self.hide_window),
                MenuItem.separator(),
                MenuItem("Restart Agent Zero", on_click=self.restart_a0),
                MenuItem.separator(),
                MenuItem("Quit", on_click=self.quit_app),
            ]
        )
        
        tray = self.app.create_tray(
            title="Agent Zero",
            menu=tray_menu,
            tooltip="Agent Zero Desktop App",
            icon=None,  # Will use default icon
        )
        
        tray.on_double_click.connect(self.show_window)
        
        return tray
    
    def show_window(self):
        """Show the main window."""
        if self.window:
            self.window.show()
            self.window.focus()
    
    def hide_window(self):
        """Hide the main window."""
        if self.window:
            self.window.hide()
    
    def restart_a0(self):
        """Restart Agent Zero server."""
        if self.a0_process:
            self.a0_process.terminate()
        self.start_agent_zero()
        
        # Notify user
        if Notification.is_supported():
            Notification(
                title="Agent Zero",
                body="Server restarted successfully!"
            ).show()
    
    def quit_app(self):
        """Quit the application."""
        if self.a0_process:
            self.a0_process.terminate()
        self.app.quit()
    
    def run(self):
        """Run the desktop application."""
        # Get port configuration
        self.port = self.get_a0_port()
        
        # Start Agent Zero
        print("Starting Agent Zero server...")
        self.start_agent_zero()
        
        # Create Pyloid application
        self.app = Pyloid(
            app_name="agent-zero",
            branch=Branches.DEVELOPMENT,
            multi_instance=False,
        )
        
        # Create window
        print("Creating desktop window...")
        self.window = self.create_window()
        
        # Create tray
        print("Creating system tray...")
        self.create_tray()
        
        # Run application
        print("Launching Agent Zero Desktop App!")
        self.app.run()


def main():
    """Entry point."""
    app = AgentZeroApp()
    app.run()


if __name__ == "__main__":
    main()
