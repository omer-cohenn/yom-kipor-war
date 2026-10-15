import asyncio, sys, base64, os, shutil, glob
from playwright.async_api import async_playwright
# view.py OUT.jpg datafile[,datafile] [names] [lod]
out, files = sys.argv[1], sys.argv[2]; names = sys.argv[3] if len(sys.argv) > 3 else ''; lod = sys.argv[4] if len(sys.argv) > 4 else '0'
os.makedirs('/home/claude/mezach/test/mdl', exist_ok=True)
shutil.copy('/home/claude/yom-kipor-war/src/4f_models.js', '/home/claude/mezach/test/mdl/4f_models.js')
for f in files.split(','): shutil.copy('/home/claude/yom-kipor-war/src/' + f, '/home/claude/mezach/test/mdl/' + f)
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = await b.new_page(viewport={"width": 1000, "height": 700}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:8765/mdlview.html?f={files}&n={names}&lod={lod}")
        await pg.wait_for_function("window.__shot", timeout=60000); d = await pg.evaluate("window.__shot")
        open(out, 'wb').write(base64.b64decode(d.split(',')[1])); print('ok', errs[:3]); await b.close()
asyncio.run(run())
