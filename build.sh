#!/usr/bin/env bash
# Builds the site into docs/ (what GitHub Pages serves): a small index.html with the loading screen, the game's code as game.<hash>.js
# (downloaded by the page with a progress bar), and the media from public/. See tools/build.py.
set -euo pipefail
cd "$(dirname "$0")"
python3 tools/build.py
