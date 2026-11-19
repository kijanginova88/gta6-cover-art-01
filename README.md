# Cover Pop — gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kijanginova88/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/kijanginova88/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Cover Pop turns a photo and a caption into a multi-panel poster in the style of a big open-world game's cover art — hero panel plus two or three side panels, a Sunset, Neon or Noir colour grade, halftone dots and vignette, and bold display lettering — then exports it as a PNG in 1080×1080, 1080×1350 or 1920×1080. It runs entirely offline from static files: photos are read on your own machine and never uploaded. All artwork is original; the two bundled sample photos were made for make.fun with an image model and are free to use.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — pick a layout and a grade, click a panel and upload a photo (or use a bundled sample), drag the photo to move it, set the zoom, type a caption and sub-caption, and export a PNG.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=thr15azb&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
