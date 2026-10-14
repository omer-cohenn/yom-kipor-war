#!/usr/bin/env bash
# Builds the game into docs/ (what GitHub Pages serves): one page (index.html) from the sources in src/, plus the media in public/.
set -euo pipefail
cd "$(dirname "$0")"
JS="2_core.js 3_world.js 16_props.js 4b_assets.js 4d_vehicles.js 4_actors.js 4c_vm.js 5_game.js 6_suez.js 7_field.js 8_rescue.js 9_cross.js 10_army.js 11_air.js 12_armor.js 13_hermon.js 15_surv.js 18_farm.js 19_range.js 17_snap.js 14_menu.js"
rm -rf docs && mkdir -p docs
{ cat src/1_shell.html; echo '<script type="module">'; for f in $JS; do cat "src/$f"; done; echo '</script>'; } > docs/index.html
cp -r public/. docs/
touch docs/.nojekyll
rm -f docs/cine/.gitkeep
echo "built docs/index.html ($(wc -c < docs/index.html) bytes)"
