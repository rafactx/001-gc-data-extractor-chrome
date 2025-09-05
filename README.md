# GamersClub Match Downloader

A Chrome extension that allows you to download complete match data from GamersClub in raw JSON format.  
It captures the complete raw data from the platform without any treatment or formatting, providing the full original response.

---

## Features

- Injects a "Download Complete JSON" button directly into the match page.  
- Captures the complete, unmodified JSON payload returned by GamersClub API.
- No data treatment or formatting - downloads the raw response as-is.
- Supports two modes:
  - Manual: trigger download via button click.  
  - Automatic: mark for download on the next page reload.  
- Generates a local file named `gamersclub_match_complete_<id>.json`.

---

## Installation (Development Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/rafactx/gc-match-downloader.git
   cd gc-match-downloader
   ```
2. Open Chrome and navigate to `chrome://extensions/`.  
3. Enable **Developer mode** (top right corner).  
4. Click **Load unpacked** and select the project directory.  
5. Navigate to a GamersClub match page (`/lobby/match/<id>`) and use the button that appears on the top-right corner.

---

## Project Structure

- `manifest.json` → extension definition and permissions.  
- `background.js` → listens for requests, captures match data, and forwards it to the content script.  
- `content.js` → injects the UI button and triggers the raw JSON download without any formatting.  

---
