# Koi Pond

A layout for [Herdr](https://herdr.dev) that adds a small pixel-art koi pond under the agents list. Everything else is Herdr's stock window.

![Koi Pond](preview.png)

Three koi swim their own loops through dark teal water, under lily banks, reeds and floating pads. They drift deeper and back up, sip at the surface, and scatter when you click near them. The pond's light follows your computer's clock:

| Night | Sunrise | Day | Afternoon | Sunset |
| --- | --- | --- | --- | --- |
| ![Night](previews/night.png) | ![Sunrise](previews/sunrise.png) | ![Day](previews/day.png) | ![Afternoon](previews/afternoon.png) | ![Sunset](previews/sunset.png) |

## Install

Ask your agent:

```
Read ~/.config/herdr-app/AGENTS.md, then add this layout: github.com/kwansing14/herdr-gallery-koi
```

Or by hand:

```sh
cp layouts/koi.json ~/.config/herdr-app/layouts/
cp -R mods/koi ~/.config/herdr-app/mods/
herdr-app check ~/.config/herdr-app/mods/koi
herdr-app do layout.switch '{"name":"koi"}'
```

Copy the mod folder rather than symlinking it: with a symlink the mod loads but every sprite renders blank. Your own layout stays as it was: `ctrl-shift-l` cycles back to it, and deleting the two copied paths removes it.

The `koi` mod runs no programs, reads no files outside its folder, keeps no state and opens no network connections.

## What's here

- `layouts/koi.json`: Herdr's stock `main` layout (from 0.1.14) with the pond added under the agents list.
- `mods/koi/`: the pond mod, its SVG art and 448 pre-built koi sprites.
- `scripts/build-koi-sprites.py`: rebuilds `mods/koi/sprites/` and `mods/koi/sprites.js` from the `koi-*.svg` layers. Needs Python 3, Pillow and `rsvg-convert` (librsvg). Run `python3 scripts/build-koi-sprites.py`; it reports `448 sprites` when done.
- `RECIPE.md`: the full brief another agent can rebuild the layout from.

## License

[MIT](LICENSE), covering the code, art and sprites.

`layouts/koi.json` is adapted from the stock `main` layout that ships with [Herdr](https://github.com/herdrdev/herdr-app), licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). The change is the `agents-area` column holding the agents list and the `koi-pond` block.
