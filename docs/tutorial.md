### Full Step-by-Step Guide: Creating the "Catch the Goblin" Game with Tauri

This guide provides each step from installing prerequisites to building the `.exe` file for the "Catch the Goblin" game.

---

### Step 1: Install Rust

1. **Download Rust**:
   - Go to the [official Rust website](https://www.rust-lang.org/tools/install/) and follow the instructions to download and install Rust, which includes `cargo`, the Rust package manager.

2. **Verify the Installation**:
   - After installation, open a terminal or command prompt and run:
     ```bash
     rustc --version
     cargo --version
     ```
   - Ensure both commands output the version information to confirm the installation.

### Step 2: Install Node.js and npm

1. **Download Node.js**:
   - Go to the [Node.js website](https://nodejs.org/) and download the latest LTS version, which includes npm (Node Package Manager).

2. **Verify the Installation**:
   - Run:
     ```bash
     node -v
     npm -v
     ```
   - This verifies Node.js and npm installations.

### Step 3: Create a New Tauri Project

1. **Initialize the Tauri Project**:
   - In the terminal, navigate to the directory where you want to create the project, then run:
     ```bash
     npm create tauri-app
     ```
   - Follow the prompts to set up the project:
     - **Project name**: `catch-the-goblin`.
     - **Unique identifier**: `com.catch-the-goblin.app`.
     - **Frontend language**: JavaScript/TypeScript, **UI template**: `Vanilla`, **UI flavor**: `JavaScript`.

2. **Navigate to the Project Directory**:
   ```bash
   cd catch-the-goblin
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Step 4: Add Game Files to `src`

1. **Copy Game Files**:
   - Copy all your project files (HTML, JavaScript, images, etc.) into the `src` directory:
     - **index.html**: The main HTML file for the game.
     - **images/**: Directory containing game images.
     - **js/game.js**: JavaScript file with the game logic.

### Step 5: Update Project Files

#### 1. Enable Fullscreen Toggling in `index.html`

- Open `src/index.html` and add JavaScript to enable fullscreen mode when `F11` is pressed:
  ```html
	<script>
		// Other initialization or game-related code can go here

		// Enable fullscreen mode when F11 is pressed
		window.addEventListener('keydown', (event) => {
			if (event.key === 'F11') {
				event.preventDefault(); // Prevent default browser action
				window.__TAURI__.event.emit("toggleFullscreen");
			}
		});

		// Additional JavaScript as needed for game setup
	</script>
  ```

#### 2. Edit `src-tauri/tauri.conf.json`

- Configure the application and window settings:
  ```json
	{
	  "$schema": "https://schema.tauri.app/config/2",
	  "productName": "catch-the-goblin",
	  "version": "0.1.0",
	  "identifier": "com.catch-the-goblin.app",
	  "build": {
		"frontendDist": "../src"
	  },
	  "app": {
		"withGlobalTauri": true,
		"windows": [
		  {
			"title": "catch-the-goblin",
			"width": 800,
			"height": 600
		  }
		],
		"security": {
		  "csp": null
		}
	  },
	  "bundle": {
		"active": true,
		"targets": "all",
		"icon": [
		  "icons/32x32.png",
		  "icons/128x128.png",
		  "icons/128x128@2x.png",
		  "icons/icon.icns",
		  "icons/icon.ico"
		]
	  }
	}
  ```

#### 3. Update `src-tauri/src/main.rs`

- Modify `main.rs` to listen for the fullscreen toggle event:

  ```rust
	// Prevents additional console window on Windows in release, DO NOT REMOVE!!
	#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
	use tauri::{Manager, Listener};

	fn main() {
		tauri::Builder::default()
			.setup(|app| {
				// Retrieve the main window using get_webview_window
				let main_window = app.get_webview_window("main").unwrap();

				// Clone main_window to use inside the closure
				let main_window_clone = main_window.clone();

				// Listen for the "toggleFullscreen" event to toggle fullscreen mode
				main_window.listen("toggleFullscreen", move |_| {
					let is_fullscreen = main_window_clone.is_fullscreen().unwrap();
					main_window_clone.set_fullscreen(!is_fullscreen).unwrap();
				});

				Ok(())
			})
			.run(tauri::generate_context!())
			.expect("error while running tauri application");
	}
  ```

### Step 6: Run the Application in Development Mode

- Start the app in development mode to test it:
  ```bash
  npm run tauri dev
  ```
- Verify that pressing `F11` toggles fullscreen mode.

### Step 7: Build the Production .exe File

1. **Build the Project**:
   - Run:
     ```bash
     npm run tauri build
     ```
2. **Locate the .exe File**:
   - After building, the `.exe` file will be in `src-tauri/target/release`. This file is ready for distribution.

---

### Summary

1. **Install Rust, Node.js, and npm**.
2. **Create a Tauri Project** and install dependencies.
3. **Add Game Files to `src`** (index.html, images/, js/).
4. **Update `index.html`** to support fullscreen toggling with `F11`.
5. **Configure `tauri.conf.json`** and **update `main.rs`** for fullscreen functionality.
6. **Run in Dev Mode** to test functionality.
7. **Build** the `.exe` file.
