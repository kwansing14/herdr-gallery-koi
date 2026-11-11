# Koi Pond

A small pixel-art koi pond that tucks under the agents list of the person's own Herdr window. Three koi swim their own loops through dark teal water, under lily banks, reeds and floating pads. They drift deeper and back up, sip at the surface, and scatter when you click near them. The pond's light follows the computer's clock: purple at night, warm orange along the top at sunrise and sunset. It is a mod: it adds the pond and changes nothing else in the window.

![Koi Pond](preview.png)

**What you see:**

- **The pond, 124px tall, sits at the bottom of the agents list,** across the sidebar. The rest of the window is the person's own layout, unchanged.
- **Size:** the block has 6px top/bottom and 8px side padding, so in Herdr's 268px sidebar the water is 252×112. It has rounded corners (10px) and a 1px border in the theme's `border` color.
- **Water:** `#102630` in a dark appearance, `#34565c` in a light one. A pixel water texture covers it, tiled every 128px (full strength in dark, 65% opacity in light).
- **Three koi:** pixel sprites, nearest-neighbour, each with a `#071b27` drop shadow 2px right and 3px down.
  - **kohaku:** white `#dee8df` with red `#cb4e60` patches; the largest, a 34px sprite.
  - **ogon:** solid gold `#d7b058` with `#997142` shading and `#f0ce7b` highlights; a 30px sprite.
  - **sanke:** white with red and black `#27333e` patches; a 30px sprite.
  - **tancho:** white with one red crown spot; a 26px sprite. It swims alone when the pond is narrower than 120px (a folded sidebar), and joins as a fourth fish when the pond is 320px or wider.
- **Banks** (positions are each image's top-left corner, w × h = pond size):
  - A lily bank fills the top-left corner: 50×35 at (−4, −7).
  - Reeds rise in the bottom-right: 27×35 at (w−21, h−49).
  - A second lily bank covers the bottom-right corner, drawn over the reeds' base: 53×43 at (w−43, h−32).
  - Each spills past the pond's edge and is clipped by its rounded corners.
- **Pads:** four small lily pads hug the edges:
  - a 9px pad at (2, h−10) and an 8px pad at (12, h−7), bottom-left;
  - a 7px pad at (48% of w, h−9) along the bottom;
  - a 7px pad at (61% of w, −2), peeking in from the top.
- **Glints:** six 1px-tall streaks in `#76a6a2` (light: `#afcfc0`). They sit at (30%, 24%), (50%, 16%), (70%, 32%), (24%, 74%), (58%, 82%) and (86%, 48%) of the pond. They are 3, 2, 4, 3, 2 and 3px wide.
- **Petal:** one 2×2 pale-green `#d4e8bd` speck at 70% opacity.
- **Daylight:** a flat tint over the whole pond follows the computer's local clock. Sunrise and sunset also add an orange glow that fades down from the top edge. The glow is drawn as 10 bands covering the top 70% of the pond, each band weaker than the one above it (quadratic falloff):
  - **Night** (20:30–4:30): dark purple `#22073c` at 60%.
  - **Sunrise** (6:00–6:30): orange `#ff8a50` at 6%, glow `#ffa060` starting at 18% at the top edge.
  - **Day** (8:00–12:00): pale sky blue `#cdefff` at 5%.
  - **Afternoon** (14:00–16:00): warm peach `#ffd08a` at 8%.
  - **Sunset** (18:00–19:00): red-orange `#ff6a2a` at 12%, glow `#ff8a30` starting at 25% at the top edge.
  - **Between those spans** the light blends smoothly (smoothstep):
    - 4:30–6:00 warms from night into sunrise;
    - 6:30–8:00 clears into day;
    - 12:00–14:00 warms into afternoon;
    - 16:00–18:00 deepens into sunset;
    - 19:00–20:30 sinks into night.
- **Layering, bottom to top:** water and texture; koi; glints; reeds; the left bank; the right bank; pads; petal; daylight tint and glow; ripples. Koi pass *under* the banks and pads, and ripples stay bright at night.

The pond at five times of day:

| Night (23:00) | Sunrise (6:15) | Day (10:00) | Afternoon (15:00) | Sunset (18:30) |
| --- | --- | --- | --- | --- |
| ![Night](previews/night.png) | ![Sunrise](previews/sunrise.png) | ![Day](previews/day.png) | ![Afternoon](previews/afternoon.png) | ![Sunset](previews/sunset.png) |

**How it behaves:**

- **Agent statuses** (working, blocked, done, idle) don't reach the pond: it looks and behaves the same in every one. The agents list above it draws them as before.
- **Swimming:** each koi follows its own closed loop.
  - **Lap time:** at full speed a lap takes 32 seconds divided by the fish's pace: kohaku 32s, ogon 29s, sanke 35s, tancho 30s. Coasting and hovering make real laps longer.
  - **Rhythm:** each fish has its own rhythm of speed bursts (kohaku 5 per lap, ogon 7, sanke 4, tancho 6) and a gentle sideways sway (±1.8px).
  - **Bends:** it slows down in tight bends.
  - **Direction:** tancho swims its loop the other way.
- **Mood:** each koi switches between three moods:
  - **Glide:** full speed, 4–10s.
  - **Coast:** 40% speed, 1.5–3.5s.
  - **Hover:** 5% speed, 1.2–3s.

  Speed eases about 70% of the way to the new mood's speed each second. Below 60% speed the koi shows its coast animation, a slow, lazy tail. Lazier fish hover and coast more and for longer. Laziness is sanke 0.65, kohaku 0.4, tancho 0.35, ogon 0.2.
- **Facing:** the sprite points in one of 16 directions, 22.5° apart. It turns toward the direction of travel at a fixed rate: kohaku 150°/s, ogon 173°/s, sanke 139°/s, tancho 161°/s. While turning, the body bends and the tail curves to the inside of the turn.
- **Depth:**
  - **Shallow:** opacity 92–100% for 8–22s.
  - **Deep:** 50–62% for 4–10s.
  - Each change crossfades over 2–4s.
- **Feeding:** every 8–15 seconds a shallow koi sips at the surface. A small 7px ring opens at its mouth and fades over 0.7s. A deep or fleeing koi tries again 2–4s later.
- **Ambient:**
  - **Glints:** pulse between 4% and 28% opacity, each on its own 4.9–6.9s cycle.
  - **Pads:** bob 1px down and back over 7.3–9.3s.
  - **Petal:** wanders the pond, sliding between 12% and 86% of the width over 43s and between 16% and 72% of the height over 27s.
- **Clicking (pressing the left mouse button) in the pond:**
  - **Splash:** a 24px ring and, 160ms later, a 12px ring open from the point and fade over 0.95s. Ring color is `#b4e2d8` (light: `#f0fffa`).
  - **Startle:** each koi within its startle reach of the click dives deep within 0.9s and stays deep for 3–6s.
    - **Reach:** sanke 27px, kohaku 29px, tancho 30px, ogon 32px.
    - **Reaction time:** 0.14–0.53s, jumpy ogon first and sanke last; a fish further from the click reacts later.
  - **Flee:** the koi turns away from the click and darts 13–31px, further when the click was closer and further for jumpy fish. It swims at 1.1–1.3× its cruising speed, with a quick tail.
  - **Return:** it pauses half a second, then swims back to the best spot on its loop and carries on gliding. Clicking a fleeing fish again sends it off again.
- **Resizing:** the loops scale to the pond's size. Below 120px wide, the banks, reeds, pads, glints and petal disappear, and tancho swims a small central loop with a smaller sway (±0.55px).
- **Appearance:** switching between dark and light appearance swaps the water, texture strength, glint and ripple colors at once. The border follows the theme.
- **Time of day:** the daylight tint and glow are recomputed on every redraw, at least once a second. The change is too slow to see. The same tint applies in dark and light.
- No keys, no hover effects, no menus.

**Built from:**

- **This folder:**
  - `mods/koi/`.
  - `scripts/build-koi-sprites.py`, which builds the sprites.
  - `previews/` (the five time-of-day shots above).
  - `preview.png`, a copy of the sunset shot.
- **Placement:** `mod.json` is `{"place":"none"}`, so Herdr docks no copy on its own; the pond shows wherever a layout has a `koi` block. Under the agents list, the layout's `agents` block becomes a column holding the agents block and the pond:
  - Column `agents-area`: the old agents block's size (weight 1 in `main`), min 190.
    - Block `agents`: weight 1, min 60, mod `agents`.
    - Block `koi-pond`: 124px, padding `[6, 8]`, mod `koi`.
  - In Herdr's `main` (0.1.14 and 0.1.15) the agents block is weight 1, min 90, the second child of column `sidebar-lists` in the 268px column `sidebar`. `main` is read-only, so the block goes into a clone: `herdr-app do layout.clone '{"name":"main","as":"main-koi"}'`, then edit `layouts/main-koi.json`.
  - In a layout of the person's own, the same column replaces their `agents` block in place.
- **Mod `koi`:**
  - **Files:**
    - `mod.json`: `{"place":"none"}`.
    - `main.js`: one `View`.
    - `sprites.js`: generated. It holds `HEADINGS` (16) and each fish's sprite `size` and `head` (mouth offset): kohaku 34/9, ogon 30/8, sanke 30/8, tancho 26/7.
  - **API used:**
    - `herdr`: only `theme().border` and `settings().dark`. It runs no commands.
    - JS: `Date` for the local hour.
    - `gpui-kit`: `div` and `image`; `.transition` (left, top, opacity, width, height); `.loop` (opacity, left, top); `.on_size_change`; `.on_mouse_down("left")` with `event.local_position`; `cx.timer.every` and `cx.timer.after`.
  - **What it doesn't do:** it runs no programs, reads no files, keeps no state and opens no network connections.
- **Ticks:**
  - **Swim tick:** every 1000ms the script moves each koi to its next point on the loop. A 1000ms linear `transition` on `left`/`top` carries it there natively.
  - **Facing tick:** every 100ms a cheap check turns each sprite. It redraws only when a fish's direction slot or bend changes.
  - **Startle:** flees and returns run as chains of `cx.timer.after` legs.
- **Loops:** a closed Catmull-Rom spline through route points, given as fractions of the pond's width and height. The spline is sampled 1600 times, then resampled evenly by arc length plus 9px per radian of turning. The extra length in bends is what slows a koi there.
  - kohaku: `.18,.55 .29,.30 .52,.24 .76,.34 .83,.53 .65,.72 .40,.77 .20,.71`
  - ogon: `.23,.50 .37,.36 .59,.39 .77,.28 .85,.47 .70,.62 .47,.65 .27,.77 .16,.65`
  - sanke: `.20,.39 .40,.22 .65,.25 .80,.42 .72,.61 .52,.54 .35,.71 .18,.65`
  - tancho: `.28,.46 .43,.33 .66,.41 .77,.59 .59,.77 .37,.65`
  - narrow pond (tancho alone): `.42,.23 .65,.34 .64,.59 .54,.78 .35,.66 .34,.41`
- **Fish:**

  | fish | phase | bursts | direction | reactivity | agility | pace | laziness |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | kohaku | .03 | 5 | 1 | .55 | .5 | 1 | .4 |
  | ogon | .38 | 7 | 1 | .9 | .8 | 1.1 | .2 |
  | sanke | .70 | 4 | 1 | .4 | .35 | .92 | .65 |
  | tancho | .52 | 6 | −1 | .7 | .65 | 1.05 | .35 |

- **Motion formulas:** in these, L is laziness and r is reactivity.
  - **Clock:** each koi keeps its own clock. Each swim tick adds 1000ms × mood rate × pace, and u = (clock mod 32000) / 32000.
  - **Place on the loop:** the place is
    `phase + direction × (u + 0.42·sin(2π·bursts·u + 2π·phase)/(2π·bursts) + 0.22·sin(4π·u + 4π·phase)/(4π))`.
    The koi is then offset sideways (perpendicular to the loop) by `1.8·sin(6π·u + 11·phase)` px. The target heading comes from the poses at u ± 0.0008.
  - **Mood choice:** the next mood is picked by weight:
    - after glide: glide .45, coast .35, hover .2;
    - after coast: hover .35, glide .65;
    - after hover: glide .7, coast .3.

    Each weight is multiplied by glide 1.4−L, coast 0.6+L, or hover 0.4+1.2L. The length drawn from the mood's range is multiplied by 1.3−0.6L for glide, or 0.7+0.6L for coast and hover. Each tick, rate += (mood rate − rate) × 0.7. The gait is `coast` when the rate is below 0.6, else `cruise`.
  - **Facing:** every 100ms, the facing moves toward the target heading by at most 150°/s × (0.75 + 0.5·agility). The bend is `right` or `left` when the current move turns faster than 0.45 rad/s, or else when the facing lags the heading by more than 0.3 rad. There is no bend while coasting. A positive turn (clockwise on screen, where y grows downward) is `right`.
  - **Depth:** shallow and deep alternate. Each picks a random opacity in its range and holds it for a random time. The crossfade is a random 2000–4000ms, or 900ms when startled.
  - **Startle:**
    - Reach is 28 × (0.8 + 0.4r).
    - The reaction delay is 100 + 350(1−r) + random·120 + 100·distance/reach ms.
    - The flee distance is lerp(14, 26, 1 − distance/reach) × (0.75 + 0.5r).
    - The flee speed is cruising × lerp(1.1, 1.3, 0.6r + 0.4·random). Cruising speed is the loop's length / 32s × pace.
    - The koi first turns toward the flee direction in 100ms legs at its turn rate. Then it swims a straight leg for the remaining distance: at least 4px, and at least 300ms.
    - Every point is clamped so the fish's center stays 0.35 × its sprite size inside each edge.
  - **Rejoin:** after a 500ms pause, the koi scores 49 points on its loop. They start where it left the loop and are 250ms of clock apart. The score is distance + 45·|bearing − loop heading| + 18·|current heading − bearing|, in radians. It swims to the lowest-scoring point at cruising speed (turn legs, then a straight leg). Then it takes that point's clock and glides at rate 1.
  - **Ripples:** each ring is a 1px-bordered circle. It grows from 2px to its size (ease-out) while fading from 85% to 0 (ease-in). It opens 34ms after it is added and is removed 450ms after it ends. At most 8 ripples exist at once.
- **Daylight blend:**
  - The anchors are at hours 0 night, 4.5 night, 6 sunrise, 6.5 sunrise, 8 day, 12 day, 14 afternoon, 16 afternoon, 18 sunset, 19 sunset, 20.5 night and 24 night.
  - Between two anchors, the tint and the glow are each blended with smoothstep t:
    - the alpha is interpolated;
    - the color is mixed, weighted by each side's alpha;
    - the result is written as a `#rrggbbaa` `bg`.
  - A phase with no glow counts as glow alpha 0. The glow bands are skipped when the glow's alpha is under 0.5%.
  - Glow band i (0–9) is ceil(0.07·h) px tall, at alpha glow × (1 − i/10)².
- **Decor sizes:** in the source art the decor sizes are multiples of a 0.55 zoom, rounded:
  - the banks are 90×64 and 96×78 at zoom 1;
  - the reeds are 49×63;
  - the pads are 17, 14, 12 and 12.
- **Sprites:** `mods/koi/sprites/<fish>-<gait>[-left|-right]-<00..15>.gif`, 448 GIFs that `image()` plays natively.
  - **Frames:** each GIF has 20 frames: two tail beats and one pectoral-fin stroke.
  - **Gaits:**
    - `cruise`: effort .55, 76ms per frame.
    - `brisk` (fleeing): effort .68, 60ms per frame.
    - `coast`: effort .18, 118ms per frame.
    - `cruise` and `brisk` also have left and right bend sheets.
  - **Count:** 7 sheets × 16 headings × 4 fish = 448.
  - **Headings:** the 16 headings are 22.5° apart, with 00 pointing right and 04 pointing down.
- **Sprite build:** `scripts/build-koi-sprites.py` (Python 3, Pillow, `rsvg-convert`).
  1. It stacks the white-filled layers `koi-body`, `koi-shade`, the marks (`koi-hi`, `koi-sumi`, `koi-tancho`), `koi-light` and `koi-eye`, recoloring each from `#fff`. It renders them at 52×34 from viewBox `24 5 52 34`.
  2. It cuts out the two pectoral fins and rotates them about their roots.
  3. It shifts each pixel column onto a 64×54 canvas to make the tail beat and the bend.
  4. It scales by fish (kohaku .88, ogon .76, sanke .8, tancho .66, all × 0.55), then rotates to the 16 headings without smoothing. It adds the shadow and maps to a fixed 14-color palette: index 0 is transparent, and anything under 100/255 alpha becomes transparent.
  5. It crops every sheet of a fish to the smallest square around the same center, then writes the GIFs and `sprites.js`.
- **Art:**
  - `water.svg` (128×128 texture);
  - `lily-bank.svg`, `lily-bank-right.svg` and `reeds.svg`;
  - `lily.svg` (the pads);
  - the `koi-*.svg` fish layers, which are build inputs only and are not drawn at runtime.

**Watch out:**

- **Copy, don't symlink:** copy `mods/koi/` into `~/.config/herdr-app/mods/`. With a symlinked mod folder, the JS loads and `herdr-app check` passes, but every `image()` renders blank.
- **Files `check` writes:** `herdr-app check` writes `jsconfig.json` and `gpui-kit.d.ts` into the mod folder. They are gitignored here.
- **Animate natively:** don't animate with a faster timer. Every `cx.notify()` redraws the whole window. The pond redraws about three times a second when idle; all motion in between is native transitions, loops and GIF playback.
- **Preloading:** a GIF shows nothing until it has loaded. Without preloading, a koi blinks out for a frame on each turn, so the mod preloads the sprites it will need next:
  - **What it loads:** headings within two slots of the current one, for the current gait and its bends, plus coast (a coasting fish preloads coast and cruise).
  - **Rate:** up to 16 new sprites a second.
  - **On a startle:** the whole turn is queued at once, for all three bends of the gait it is about to use.
  - **How:** each preloaded sprite is drawn as an invisible 1×1 `image()` for 600ms, and is never preloaded again once seen.
- **Sprite centering:** sprites are positioned by their center, so each GIF canvas must stay centered on the fish. The crop keeps the center; an off-center crop makes koi jump when they turn.
- **Bend direction:** the `-right` sheets curve the tail to the fish's right, which is the inside of a clockwise turn on screen. Flip the sign and the tail flares outward, so the fish looks like it turns the other way.
- **Click targets:** clicks and the feeding ring use where a koi is *drawn*, interpolated along its current move. They don't use the move's end point, which can be tens of pixels away while fleeing.
- **Size before first layout:** the pond assumes 252×112 until its first size report. On resize the loops are rebuilt and the koi are placed at their current point without skipping ahead. Fleeing koi finish their flee first.
- **Size limits:**
  - under 120px wide: only tancho, and no decor;
  - 120–319px: three koi;
  - 320px and up (a sidebar of 336px or more): four koi.
- **Memory:** if every sheet of every fish gets loaded, the decoded frames take about 33 MB.
- **Nothing shows after copying:** with `place: none`, copying `mods/koi/` adds no block. The pond appears once the shown layout has a `koi` block.
- **Shipped layouts are read-only:** don't add the block to Herdr's `main.json` itself. The next start moves the edited file to `main-edited` and restores Herdr's version. Clone `main` and edit the clone.
- **Other spots:** the pond fills whatever block holds it and its loops scale, but the art is drawn for about 252×112. In a much bigger block the banks stay in their corners with open water between.
- **Rebuilding sprites:** rebuilding overwrites `mods/koi/sprites/` and `sprites.js`. With the same Pillow and librsvg versions, a rebuild with unchanged inputs produces identical files; other versions may shift antialiased edge pixels.
- **Screenshots:** `herdr-app shot` returns the last frame drawn, which goes stale while Herdr is behind another app. Bring Herdr to the front before taking one.

**Done when:**

- `herdr-app check ~/.config/herdr-app/mods/koi` passes, and with the `koi-pond` block in the shown layout, `herdr-app status` shows `"errors": []`.
- In a 268px sidebar, a 252×112 pond with a rounded border sits under the agents list. Everything else in the layout looks as it did before.
- Kohaku, ogon and sanke swim continuously, pass under the banks and pads, and never leave the water.
- A turning koi bends its tail toward the inside of the turn, and no koi blinks out while turning.
- Every 8–15 seconds each shallow koi opens a small ring at its mouth.
- Clicking just beside a koi shows two splash rings. The koi fades deeper, darts away within about half a second, and is back on its loop within a few seconds.
- Folding the sidebar leaves only tancho in a plain narrow pond; unfolding brings back the three koi and the decor.
- Switching to a light appearance lightens the water to `#34565c`.
- The pond follows the computer's clock:
  - dark purple at night;
  - a faint orange warmth along its top edge at sunrise, and a slightly stronger one at sunset;
  - faintly warm in the afternoon.
- `python3 scripts/build-koi-sprites.py` prints `448 sprites`, and the koi look and swim the same afterwards.
