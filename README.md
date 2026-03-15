# SiteMagic Chrome Extension

`site-magical` is a Chrome extension that allows users to customize the appearance of any website. It provides a side panel UI where users can create and manage multiple styling rules. These rules can be applied globally to an entire site or targeted to specific CSS selectors.

## Installation

1.  Clone this repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Build the extension:
    ```bash
    npm run build
    ```
4.  Open Chrome and navigate to `chrome://extensions`.
5.  Enable "Developer mode".
6.  Click "Load unpacked" and select the `dist` directory from this project.

## Development

To run the extension in development mode with live reloading:

```bash
npm run dev
```

This will watch for changes in the `src/` directory and automatically rebuild the extension. You will need to manually reload the extension in Chrome to see the changes.

## Project Overview

*   **Build System**: `@nmhillusion/n2ngin-bull-engine` is used for compiling the project. It handles TypeScript, Pug, and SCSS, and copies static assets.
*   **Language**: The extension is written in TypeScript.
*   **Templating**: The popup's UI is defined using Pug.
*   **Styling**: The popup's UI is styled with SCSS.
*   **Frameworks**: The project is vanilla TypeScript with no major frontend frameworks like React or Vue.

## Detailed Architecture

### 1. Build Process

The build process is defined in `build.mts`. It performs the following steps:
1.  Cleans the `dist/` directory.
2.  Copies all files from the `public/` directory (including `manifest.json` and icons) to `dist/`.
3.  Uses `@nmhillusion/n2ngin-bull-engine` to:
    *   Compile `src/**/*.ts` to JavaScript.
    *   Compile `src/popup/popup.pug` to `dist/popup/popup.html`.
    *   Compile `src/popup/popup.scss` to `dist/popup/popup.css`.

### 2. Extension Components

*   **Background Script (`background.ts`)**: Its sole responsibility is to configure the Chrome side panel to open when the user clicks the extension's action icon in the toolbar.

*   **Content Script (`content.ts`)**: This is the workhorse of the extension.
    *   **Style Injection**: It dynamically creates a `<style>` tag with the ID `site-magic-styles` and injects it into the active webpage. The content of this tag is generated based on the rules a user defines.
    *   **Font Loading**: It dynamically loads any required Google Fonts by creating and appending a `<link>` tag to the document head.
    *   **Element Picker**: It provides the logic for an element selection tool. When activated, it listens for mouse movements to highlight elements and for a click to select an element. It then generates a robust CSS selector for the target element and sends it back to the popup.
    *   **Communication**: It listens for messages from the popup script to `reapplyStyles` or `startPicking` for an element.

*   **Side Panel/Popup (`popup.ts`)**: This script powers the user interface in the side panel.
    *   **Rule Management**: It manages a collection of `StyleRule` objects, which are the core data structure for storing style information. Users can add, delete, and switch between rules.
    *   **UI Controls**: It binds UI elements (sliders, color pickers, dropdowns, etc.) to the properties of the active `StyleRule`.
    *   **State Persistence**: All style rules are saved to `chrome.storage.sync`, allowing them to persist across browser sessions and sync between devices.
    *   **Live Preview**: As the user modifies a style, the popup script sends messages to the content script to update the styles on the page in real-time.
    *   **Legacy Migration**: It includes logic to migrate settings from a previous version of the extension that only supported a single style rule.

### 3. Data Flow

1.  **Loading**:
    *   When a webpage loads, `content.ts` is injected.
    *   It immediately fetches the saved style rules from `chrome.storage.sync` and applies them.
    *   When the user opens the side panel, `popup.ts` loads and also fetches the rules from storage to populate the UI.

2.  **User Interaction**:
    *   User modifies a style in the popup (e.g., changes a color).
    *   `popup.ts` updates its internal state.
    *   `popup.ts` sends a `reapplyStyles` message with the updated rules to `content.ts`.
    *   `content.ts` receives the message, regenerates the CSS, and updates the `<style id="site-magic-styles">` tag on the page.
    *   The changes are debounced and then saved to `chrome.storage.sync`.

3.  **Element Picking**:
    *   User clicks the "Pick Element" button in the popup.
    *   `popup.ts` sends a `startPicking` message to `content.ts`.
    *   `content.ts` enables its element selection mode (crosshair cursor, outlines on hover).
    *   User clicks an element on the page.
    *   `content.ts` calculates a unique CSS selector for that element.
    *   `content.ts` sends a `pickingComplete` message with the selector back to `popup.ts`.
    *   `popup.ts` receives the selector and updates the `targetSelector` for the currently active style rule.
    *   The updated rule is then applied and saved.
