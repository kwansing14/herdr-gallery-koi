import { View, div, image } from "gpui-kit";
import { theme, settings } from "herdr";
import { HEADINGS, SPRITES } from "./sprites.js";

const art = (name) => `mods/koi/${name}`;
const ZOOM = 0.55;
const z = (n) => Math.round(n * ZOOM);
const TAU = Math.PI * 2;

const LOOP = 32000;
const STEP = 1000;
const REACH = 28;
const EDGE = 0.35;
const FLEE = [14, 26];
const SPEEDUP = [1.1, 1.3];
const NOTICE = { base: 100, calm: 350, jitter: 120, far: 100 };
const BEND_ABOVE = 0.45;
const BEND_LAG = 0.3;
const LINGER = 500;
const REJOIN_LOOKAHEAD = 48;
const TURN_RATE = 150;
const TURN_STEP = 100;
const TURN_PER_STEP = ((TURN_RATE * Math.PI) / 180) * (TURN_STEP / 1000);

const MOODS = {
  glide: { rate: 1, last: [4000, 10000], next: [["glide", 0.45], ["coast", 0.35], ["hover", 0.2]] },
  coast: { rate: 0.4, last: [1500, 3500], next: [["hover", 0.35], ["glide", 0.65]] },
  hover: { rate: 0.05, last: [1200, 3000], next: [["glide", 0.7], ["coast", 0.3]] },
};
const EASE_RATE = 1 - 0.3 ** (STEP / 1000);
const COAST_BELOW = 0.6;

const DEPTHS = {
  shallow: { opacity: [0.92, 1], last: [8000, 22000] },
  deep: { opacity: [0.5, 0.62], last: [4000, 10000] },
};
const DIVE = [2000, 4000];
const STARTLE_DIVE = 900;
const STARTLE_DEEP = [3000, 6000];

const GULP = [8000, 15000];
const GULP_RETRY = [2000, 4000];

const SCHOOL = [
  { name: "kohaku", phase: 0.03, bursts: 5, direction: 1, temper: { reactivity: 0.55, agility: 0.5, pace: 1, laziness: 0.4 }, route: [[0.18, 0.55], [0.29, 0.3], [0.52, 0.24], [0.76, 0.34], [0.83, 0.53], [0.65, 0.72], [0.4, 0.77], [0.2, 0.71]] },
  { name: "ogon", phase: 0.38, bursts: 7, direction: 1, temper: { reactivity: 0.9, agility: 0.8, pace: 1.1, laziness: 0.2 }, route: [[0.23, 0.5], [0.37, 0.36], [0.59, 0.39], [0.77, 0.28], [0.85, 0.47], [0.7, 0.62], [0.47, 0.65], [0.27, 0.77], [0.16, 0.65]] },
  { name: "sanke", phase: 0.7, bursts: 4, direction: 1, temper: { reactivity: 0.4, agility: 0.35, pace: 0.92, laziness: 0.65 }, route: [[0.2, 0.39], [0.4, 0.22], [0.65, 0.25], [0.8, 0.42], [0.72, 0.61], [0.52, 0.54], [0.35, 0.71], [0.18, 0.65]] },
  { name: "tancho", phase: 0.52, bursts: 6, direction: -1, temper: { reactivity: 0.7, agility: 0.65, pace: 1.05, laziness: 0.35 }, route: [[0.28, 0.46], [0.43, 0.33], [0.66, 0.41], [0.77, 0.59], [0.59, 0.77], [0.37, 0.65]] },
];
const COMPACT_ROUTE = [[0.42, 0.23], [0.65, 0.34], [0.64, 0.59], [0.54, 0.78], [0.35, 0.66], [0.34, 0.41]];

const GLINTS = [[0.3, 0.24, 6, 5100], [0.5, 0.16, 4, 6300], [0.7, 0.32, 8, 5700], [0.24, 0.74, 5, 6900], [0.58, 0.82, 4, 4900], [0.86, 0.48, 5, 6100]];

const WATER = {
  dark: { shallow: "#102630", texture: 1, glint: "#76a6a2", ripple: "#b4e2d8" },
  light: { shallow: "#34565c", texture: 0.65, glint: "#afcfc0", ripple: "#f0fffa" },
};

const DAYLIGHT = {
  night: { tint: ["#22073c", 0.6] },
  sunrise: { tint: ["#ff8a50", 0.06], glow: ["#ffa060", 0.18] },
  day: { tint: ["#cdefff", 0.05] },
  afternoon: { tint: ["#ffd08a", 0.08] },
  sunset: { tint: ["#ff6a2a", 0.12], glow: ["#ff8a30", 0.25] },
};
const UNLIT = ["#000000", 0];
const GLOW = { bands: 10, reach: 0.7 };
const ROUND = 10;
const TILE = 128;

const SKY = [[0, "night"], [4.5, "night"], [6, "sunrise"], [6.5, "sunrise"], [8, "day"], [12, "day"], [14, "afternoon"], [16, "afternoon"], [18, "sunset"], [19, "sunset"], [20.5, "night"], [24, "night"]];

const RIPPLES = {
  splash: { rings: [["outer", 24, 0], ["inner", 12, 160]], duration: 950 },
  gulp: { rings: [["gulp", 7, 0]], duration: 700 },
};

const wrap = (n, m) => ((n % m) + m) % m;

const spline = (points, t) => {
  const n = points.length, pos = wrap(t, 1) * n, i = Math.floor(pos), u = pos - i;
  const [a, b, c, d] = [-1, 0, 1, 2].map((k) => points[wrap(i + k, n)]);
  return [0, 1].map((j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u * u + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u * u * u));
};

const swimPath = (points) => {
  const samples = Array.from({ length: 1601 }, (_, i) => spline(points, i / 1600));
  const headings = samples.slice(1).map((b, i) => Math.atan2(b[1] - samples[i][1], b[0] - samples[i][0]));
  const lengths = [0];
  for (let i = 0; i < 1600; i++) {
    const before = headings[wrap(i - 1, 1600)];
    const turn = Math.atan2(Math.sin(headings[i] - before), Math.cos(headings[i] - before));
    const [a, b] = [samples[i], samples[i + 1]];
    lengths.push(lengths[i] + Math.hypot(b[0] - a[0], b[1] - a[1]) + 9 * Math.abs(turn));
  }
  const result = [];
  let index = 0;
  for (let i = 0; i < 1600; i++) {
    const target = (i / 1600) * lengths[1600];
    while (lengths[index + 1] < target) index++;
    const weight = (target - lengths[index]) / Math.max(0.0001, lengths[index + 1] - lengths[index]);
    result.push([0, 1].map((j) => samples[index][j] * (1 - weight) + samples[index + 1][j] * weight));
  }
  return result;
};

const between = ([low, high]) => low + Math.random() * (high - low);

const angleTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

const pathLength = (path) => path.reduce((sum, a, i) => {
  const b = path[(i + 1) % path.length];
  return sum + Math.hypot(b[0] - a[0], b[1] - a[1]);
}, 0);

const at = (path, progress) => {
  const p = wrap(progress, 1) * path.length, i = Math.floor(p), u = p - i;
  const a = path[i], b = path[(i + 1) % path.length];
  return [a[0] * (1 - u) + b[0] * u, a[1] * (1 - u) + b[1] * u];
};

const swimProgress = (fish, u) => {
  const seed = fish.phase * TAU;
  const burst = TAU * fish.bursts * u + seed;
  const cruise = TAU * 2 * u + seed * 2;
  return fish.phase + fish.direction * (u + (0.42 * Math.sin(burst)) / (TAU * fish.bursts) + (0.22 * Math.sin(cruise)) / (TAU * 2));
};

const pose = (path, fish, u, compact) => {
  const progress = swimProgress(fish, u);
  const [x, y] = at(path, progress);
  const before = at(path, progress - 0.002), after = at(path, progress + 0.002);
  const heading = Math.atan2(after[1] - before[1], after[0] - before[0]);
  const drift = (compact ? 0.55 : 1.8) * Math.sin(TAU * 3 * u + fish.phase * 11);
  return [x - Math.sin(heading) * drift, y + Math.cos(heading) * drift];
};

const drawn = (koi, now) => {
  if (!koi.from) return [koi.x, koi.y];
  const t = Math.min(1, Math.max(0, (now - koi.since) / koi.motion.duration));
  return [koi.from[0] + (koi.x - koi.from[0]) * t, koi.from[1] + (koi.y - koi.from[1]) * t];
};

const slot = (heading) => wrap(Math.round(heading / (TAU / HEADINGS)), HEADINGS);

const sheet = (name, gait, bend, index) =>
  art(`sprites/${name}-${gait}${bend ? `-${bend}` : ""}-${String(wrap(index, HEADINGS)).padStart(2, "0")}.gif`);

const sprite = (name, gait, heading, bend) => sheet(name, gait, bend, slot(heading));

const WARM_PER_TICK = Math.round((16 * STEP) / 1000);
const WARM_MS = 600;

const lerp = ([low, high], t) => low + (high - low) * t;

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const byte = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");

const mix = ([c1, a1], [c2, a2], t) => {
  const alpha = a1 + (a2 - a1) * t;
  const [p, q] = [channels(c1), channels(c2)];
  return [p.map((c, k) => (c * a1 * (1 - t) + q[k] * a2 * t) / Math.max(alpha, 0.0001)), alpha];
};

const rgba = ([rgb, alpha]) => `#${rgb.map(byte).join("")}${byte(alpha * 255)}`;

const daylight = (date) => {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const i = SKY.findIndex(([at]) => at > hour);
  const [[start, a], [end, b]] = [SKY[i - 1], SKY[i]];
  const u = (hour - start) / (end - start);
  const t = u * u * (3 - 2 * u);
  const [from, to] = [DAYLIGHT[a], DAYLIGHT[b]];
  return { tint: mix(from.tint, to.tint, t), glow: mix(from.glow ?? UNLIT, to.glow ?? UNLIT, t) };
};

const radius = (w, h) => Math.max(0, Math.min(ROUND, Math.floor(w / 2), Math.floor(h / 2)));

const clip = (x, y, w, h, children) =>
  div().absolute().left(x).top(y).w(w).h(h).overflow_hidden().children(children);

const CORNERS = [
  { right: false, bottom: false, round: "rounded_tl" },
  { right: true, bottom: false, round: "rounded_tr" },
  { right: false, bottom: true, round: "rounded_bl" },
  { right: true, bottom: true, round: "rounded_br" },
];

const texture = (w, h, opacity) => {
  const r = radius(w, h);
  const tile = (x, y) => image(art("water.svg")).absolute().left(x).top(y).size(TILE).opacity(opacity);
  const grid = (x0, y0, cw, ch) => {
    if (cw <= 0 || ch <= 0) return [];
    const tiles = [];
    for (let ty = Math.floor(y0 / TILE) * TILE; ty < y0 + ch; ty += TILE)
      for (let tx = Math.floor(x0 / TILE) * TILE; tx < x0 + cw; tx += TILE) tiles.push(tile(tx - x0, ty - y0));
    return [clip(x0, y0, cw, ch, tiles)];
  };
  const corners = r === 0 ? [] : CORNERS.map(({ right, bottom, round }) =>
    clip(right ? w - r : 0, bottom ? h - r : 0, r, r, [tile(right ? r - TILE : 0, bottom ? r - TILE : 0)[round](r)]));
  return [...grid(r, 0, w - 2 * r, r), ...grid(0, r, w, h - 2 * r), ...grid(r, h - r, w - 2 * r, r), ...corners];
};

const band = (y0, y1, w, h, color) => {
  const r = radius(w, h);
  const strip = (a, b, x, sw) => div().absolute().left(x).top(a).w(sw).h(b - a).bg(color);
  const pieces = [];
  const middle = [Math.max(y0, r), Math.min(y1, h - r)];
  if (middle[1] > middle[0]) pieces.push(strip(...middle, 0, w));
  for (const [a, b, bottom] of [[y0, Math.min(y1, r), false], [Math.max(y0, h - r), y1, true]]) {
    if (b <= a) continue;
    pieces.push(strip(a, b, r, w - 2 * r));
    for (const right of [false, true]) pieces.push(clip(right ? w - r : 0, a, r, b - a, [
      div().absolute().left(right ? -r : 0).top((bottom ? h - 2 * r : 0) - a).size(2 * r).rounded(r).bg(color)]));
  }
  return pieces;
};

const sunlight = (w, h, date) => {
  const { tint, glow: [glow, strength] } = daylight(date);
  const step = Math.ceil((h * GLOW.reach) / GLOW.bands);
  const bands = strength < 0.005 ? [] : Array.from({ length: GLOW.bands }, (_, i) =>
    band(i * step, (i + 1) * step, w, h, rgba([glow, strength * (1 - i / GLOW.bands) ** 2]))).flat();
  return [div().absolute().left(0).top(0).w(w).h(h).rounded(radius(w, h)).bg(rgba(tint)), ...bands];
};

export default class KoiPond extends View {
  init(_props, cx) {
    this.size = { width: 252, height: 112 };
    this.ripples = [];
    this.seq = 0;
    this.koi = {};
    this.paths = {};
    this.seen = new Set();
    this.warm = new Map();
    this.budget = WARM_PER_TICK;
    this.regroup();
    cx.timer.every(STEP, (cx) => {
      this.swim(cx);
      cx.notify();
    });
    cx.timer.every(TURN_STEP, (cx) => {
      if (this.steer()) cx.notify();
    });
  }

  pond() {
    const w = Math.round(this.size.width), h = Math.round(this.size.height);
    const compact = w < 120;
    return { w, h, compact, school: compact ? [SCHOOL[3]] : SCHOOL.slice(0, w >= 320 ? 4 : 3) };
  }

  path(fish, { w, h, compact }) {
    const key = `${fish.name}-${w}x${h}`;
    this.paths[key] ??= swimPath((compact ? COMPACT_ROUTE : fish.route).map(([fx, fy]) => [fx * w, fy * h]));
    return this.paths[key];
  }

  cruising(fish, pond) {
    return (pathLength(this.path(fish, pond)) / (LOOP / 1000)) * fish.temper.pace;
  }

  poseAt(fish, pond, clock) {
    const path = this.path(fish, pond);
    const u = wrap(clock, LOOP) / LOOP;
    const [x, y] = pose(path, fish, u, pond.compact);
    const a = pose(path, fish, u - 0.0008, pond.compact), b = pose(path, fish, u + 0.0008, pond.compact);
    return [x, y, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }

  hatch(fish, now) {
    const depth = DEPTHS.shallow;
    return {
      hold: 0, clock: now, rate: 1, turning: 0,
      turnStep: TURN_PER_STEP * (0.75 + 0.5 * fish.temper.agility),
      mood: "glide", moodUntil: now + between(MOODS.glide.last),
      depth: "shallow", opacity: between(depth.opacity), depthMs: between(DIVE), depthUntil: now + between(depth.last),
      gulpAt: now + between(GULP),
    };
  }

  settle(fish, koi, now) {
    if (now < koi.moodUntil) return;
    const lazy = fish.temper.laziness;
    const lean = { glide: 1.4 - lazy, coast: 0.6 + lazy, hover: 0.4 + 1.2 * lazy };
    const options = MOODS[koi.mood].next.map(([mood, chance]) => [mood, chance * lean[mood]]);
    let roll = Math.random() * options.reduce((sum, [, weight]) => sum + weight, 0);
    const [next] = options.find(([, weight]) => (roll -= weight) < 0) ?? options.at(-1);
    const stretch = next === "glide" ? 1.3 - 0.6 * lazy : 0.7 + 0.6 * lazy;
    Object.assign(koi, { mood: next, moodUntil: now + between(MOODS[next].last) * stretch });
  }

  sink(koi, depth, ms, last, now) {
    Object.assign(koi, { depth, opacity: between(DEPTHS[depth].opacity), depthMs: ms, depthUntil: now + ms + between(last) });
  }

  drift(koi, now) {
    if (now < koi.depthUntil) return;
    const depth = koi.depth === "shallow" ? "deep" : "shallow";
    this.sink(koi, depth, between(DIVE), DEPTHS[depth].last, now);
  }

  gulp(fish, koi, now, cx) {
    if (now < koi.gulpAt) return;
    if (koi.depth !== "shallow" || koi.hold > now) {
      koi.gulpAt = now + between(GULP_RETRY);
      return;
    }
    const { head } = SPRITES[fish.name];
    const [x, y] = drawn(koi, now);
    this.ripple("gulp", x + Math.cos(koi.face) * head, y + Math.sin(koi.face) * head, cx);
    koi.gulpAt = now + between(GULP);
  }

  need(path, urgent) {
    if (this.seen.has(path) || this.warm.has(path)) return;
    if (!urgent) {
      if (this.budget <= 0) return;
      this.budget--;
    }
    this.warm.set(path, Date.now() + WARM_MS);
  }

  ripen(now) {
    for (const [path, ready] of this.warm) {
      if (now < ready) continue;
      this.warm.delete(path);
      this.seen.add(path);
    }
    this.budget = WARM_PER_TICK;
  }

  anticipate(fish, koi) {
    const here = slot(koi.face);
    const looks = koi.gait === "coast"
      ? [["coast", null], ["cruise", null]]
      : [[koi.gait, null], [koi.gait, "left"], [koi.gait, "right"], ["coast", null]];
    for (const step of [0, 1, -1, 2, -2]) {
      for (const [gait, bend] of looks) this.need(sheet(fish.name, gait, bend, here + step));
    }
  }

  prepare(fish, from, to, gait) {
    const start = slot(from);
    const steps = Math.round(angleTo(from, to) / (TAU / HEADINGS));
    const direction = Math.sign(steps) || 1;
    for (let i = -1; i <= Math.abs(steps) + 1; i++) {
      for (const bend of [null, "left", "right"]) this.need(sheet(fish.name, gait, bend, start + direction * i), true);
    }
  }

  move(koi, { x, y, heading, duration }, now) {
    const from = koi.x === undefined ? [x, y] : drawn(koi, now);
    const turning = koi.heading === undefined ? 0 : angleTo(koi.heading, heading) / (duration / 1000);
    Object.assign(koi, { from, since: now, x, y, heading, turning, motion: { duration, easing: "linear" } });
  }

  place(fish, koi, pond, now) {
    const [x, y, heading] = this.poseAt(fish, pond, koi.clock);
    this.move(koi, { x, y, heading, duration: STEP }, now);
    koi.gait = koi.rate < COAST_BELOW ? "coast" : "cruise";
    koi.face ??= heading;
    this.anticipate(fish, koi);
  }

  regroup() {
    const pond = this.pond();
    const now = Date.now();
    for (const fish of pond.school) {
      const koi = (this.koi[fish.name] ??= this.hatch(fish, now));
      if (koi.hold <= now) this.place(fish, koi, pond, now);
    }
  }

  swim(cx) {
    const pond = this.pond();
    const now = Date.now();
    this.ripen(now);
    for (const fish of pond.school) {
      const koi = (this.koi[fish.name] ??= this.hatch(fish, now));
      this.drift(koi, now);
      if (koi.hold > now) continue;
      this.settle(fish, koi, now);
      koi.rate += (MOODS[koi.mood].rate - koi.rate) * EASE_RATE;
      koi.clock += STEP * koi.rate * fish.temper.pace;
      this.place(fish, koi, pond, now);
      this.gulp(fish, koi, now, cx);
    }
  }

  steer() {
    let changed = false;
    for (const fish of this.pond().school) {
      const koi = this.koi[fish.name];
      if (!koi) continue;
      const diff = angleTo(koi.face, koi.heading);
      if (Math.abs(diff) < 0.001) continue;
      const before = [slot(koi.face), this.bend(koi)];
      koi.face += Math.max(-koi.turnStep, Math.min(koi.turnStep, diff));
      if (slot(koi.face) !== before[0] || this.bend(koi) !== before[1]) changed = true;
    }
    return changed;
  }

  bend(koi) {
    if (koi.gait === "coast") return null;
    const lag = angleTo(koi.face, koi.heading);
    const turning = Math.abs(koi.turning) > BEND_ABOVE ? koi.turning : Math.abs(lag) > BEND_LAG ? lag : 0;
    return turning > 0 ? "right" : turning < 0 ? "left" : null;
  }

  bounds(fish) {
    const { w, h } = this.pond();
    const margin = SPRITES[fish.name].size * EDGE;
    return (x, y) => [Math.min(w - margin, Math.max(margin, x)), Math.min(h - margin, Math.max(margin, y))];
  }

  turn(fish, koi, toward, speed) {
    const clamp = this.bounds(fish);
    const delta = angleTo(koi.heading, toward);
    const steps = Math.ceil(Math.abs(delta) / koi.turnStep);
    const stride = (speed * TURN_STEP) / 1000;
    const legs = [];
    let [x, y] = drawn(koi, Date.now());
    for (let i = 1; i <= steps; i++) {
      const heading = koi.heading + (delta * i) / steps;
      [x, y] = clamp(x + Math.cos(heading) * stride, y + Math.sin(heading) * stride);
      legs.push({ x, y, heading, duration: TURN_STEP });
    }
    return { legs, x, y, time: steps * TURN_STEP };
  }

  follow(koi, token, legs, cx, done) {
    if (koi.token !== token) return;
    const [leg, ...rest] = legs;
    if (!leg) {
      done(cx);
      return;
    }
    this.move(koi, leg, Date.now());
    cx.notify();
    cx.timer.after(leg.duration, (cx) => this.follow(koi, token, rest, cx, done));
  }

  scatter(x, y, cx) {
    const pond = this.pond();
    pond.school.forEach((fish) => {
      const koi = this.koi[fish.name];
      if (!koi) return;
      const { reactivity } = fish.temper;
      const reach = REACH * (0.8 + 0.4 * reactivity);
      const now = Date.now();
      const [fx, fy] = drawn(koi, now);
      const dist = Math.hypot(fx - x, fy - y);
      if (dist > reach) return;
      const token = (koi.token ?? 0) + 1;
      if (koi.hold <= now) koi.left = koi.clock;
      Object.assign(koi, { token, hold: Infinity });
      this.sink(koi, "deep", STARTLE_DIVE, STARTLE_DEEP, now);
      const flee = dist < 1 ? koi.heading : Math.atan2(fy - y, fx - x);
      this.prepare(fish, koi.face, flee, "brisk");
      this.need(sprite(fish.name, "cruise", flee, null), true);
      const notice = NOTICE.base + (1 - reactivity) * NOTICE.calm + Math.random() * NOTICE.jitter + (dist / reach) * NOTICE.far;
      cx.timer.after(Math.round(notice), (cx) => {
        if (koi.token !== token) return;
        const [nx, ny] = drawn(koi, Date.now());
        const away = Math.hypot(nx - x, ny - y) < 1 ? koi.heading : Math.atan2(ny - y, nx - x);
        const speed = this.cruising(fish, pond) * lerp(SPEEDUP, 0.6 * reactivity + 0.4 * Math.random());
        const travel = lerp(FLEE, 1 - dist / reach) * (0.75 + 0.5 * reactivity);
        const arc = this.turn(fish, koi, away, speed);
        const rest = Math.max(4, travel - (speed * arc.time) / 1000);
        const [tx, ty] = this.bounds(fish)(arc.x + Math.cos(away) * rest, arc.y + Math.sin(away) * rest);
        const duration = Math.round(Math.max(300, (Math.hypot(tx - arc.x, ty - arc.y) / speed) * 1000));
        koi.gait = "brisk";
        this.follow(koi, token, [...arc.legs, { x: tx, y: ty, heading: away, duration }], cx, (cx) => {
          koi.gait = "cruise";
          const best = this.plan(fish, koi);
          this.prepare(fish, koi.heading, Math.atan2(best.y - koi.y, best.x - koi.x), "cruise");
          cx.notify();
          cx.timer.after(LINGER, (cx) => {
            if (koi.token === token) this.rejoin(fish, koi, token, cx, best);
          });
        });
      });
    });
  }

  plan(fish, koi) {
    const pond = this.pond();
    let best = null;
    for (let k = 0; k <= REJOIN_LOOKAHEAD; k++) {
      const clock = koi.left + k * 250;
      const [x, y, heading] = this.poseAt(fish, pond, clock);
      const bearing = Math.atan2(y - koi.y, x - koi.x);
      const score = Math.hypot(x - koi.x, y - koi.y) + 45 * Math.abs(angleTo(bearing, heading)) + 18 * Math.abs(angleTo(koi.heading, bearing));
      if (!best || score < best.score) best = { clock, x, y, score };
    }
    return best;
  }

  rejoin(fish, koi, token, cx, best) {
    const speed = this.cruising(fish, this.pond());
    const arc = this.turn(fish, koi, Math.atan2(best.y - koi.y, best.x - koi.x), speed);
    const duration = Math.round(Math.max(300, (Math.hypot(best.x - arc.x, best.y - arc.y) / speed) * 1000));
    const leg = { x: best.x, y: best.y, heading: Math.atan2(best.y - arc.y, best.x - arc.x), duration };
    this.follow(koi, token, [...arc.legs, leg], cx, () => {
      Object.assign(koi, { clock: best.clock, hold: 0, mood: "glide", rate: 1, moodUntil: Date.now() + between(MOODS.glide.last) });
    });
  }

  ripple(kind, x, y, cx) {
    const ripple = { id: ++this.seq, kind, x: Math.round(x), y: Math.round(y), open: false };
    this.ripples = [...this.ripples.slice(-7), ripple];
    cx.notify();
    cx.timer.after(34, (cx) => {
      ripple.open = true;
      cx.notify();
    });
    cx.timer.after(RIPPLES[kind].duration + 450, (cx) => {
      this.ripples = this.ripples.filter((r) => r !== ripple);
      cx.notify();
    });
  }

  splash(event, cx) {
    const point = event.local_position;
    if (!point) return;
    this.ripple("splash", point.x, point.y, cx);
    this.scatter(point.x, point.y, cx);
  }

  ring(ripple, [tag, size, delay], color) {
    const half = Math.ceil(size / 2);
    const motion = { duration: RIPPLES[ripple.kind].duration, delay, easing: "ease-out" };
    return div().absolute().left(ripple.x - half).top(ripple.y - half).size(half * 2)
      .flex().items_center().justify_center()
      .child(div().id(`ripple${ripple.id}-${tag}`).rounded(half).border(1).border_color(color)
        .w(ripple.open ? size : 2).h(ripple.open ? size : 2).opacity(ripple.open ? 0 : 0.85)
        .transition("width", motion).transition("height", motion)
        .transition("opacity", { ...motion, easing: "ease-in" }));
  }

  fish(fish) {
    const koi = this.koi[fish.name];
    if (!koi) return null;
    const { size } = SPRITES[fish.name];
    const path = sprite(fish.name, koi.gait, koi.face ?? koi.heading, this.bend(koi));
    this.seen.add(path);
    return div().id(`koi-${fish.name}`).absolute()
      .left(Math.round(koi.x - size / 2)).top(Math.round(koi.y - size / 2)).size(size)
      .opacity(koi.opacity).transition("opacity", { duration: Math.round(koi.depthMs), easing: "ease-in-out" })
      .transition("left", koi.motion).transition("top", koi.motion)
      .child(image(path).size(size));
  }

  render() {
    const t = theme();
    const water = settings()?.dark === false ? WATER.light : WATER.dark;
    const scale = Number(settings()?.zoom) || 1;
    const pond = this.pond();
    const { w, h, compact: narrow } = pond;
    const key = `${w}x${h}`;
    const pads = narrow ? [] : [
      ["lily.svg", z(17), z(7), h - z(22), 9100],
      ["lily.svg", z(14), z(22), h - z(12), 7300],
      ["lily.svg", z(12), Math.round(w * 0.48), h - z(16), 8100],
      ["lily.svg", z(12), Math.round(w * 0.61), -z(3), 9300],
    ];

    return div().id("koi-pond").relative().size_full().overflow_hidden().rounded(ROUND)
      .bg(water.shallow)
      .on_size_change((raw, cx) => {
        const scale = Number(settings()?.zoom) || 1;
        const size = { width: raw.width / scale, height: raw.height / scale };
        if (Math.round(size.width) === w && Math.round(size.height) === h) return;
        this.size = size;
        this.paths = {};
        this.regroup();
        cx.notify();
      })
      .on_mouse_down("left", (event, cx) => this.splash(event, cx))
      .children([...this.warm.keys()].map((path) => image(path).absolute().size(1).opacity(0)))
      .children(texture(w, h, water.texture))
      .children(pond.school.map((fish) => this.fish(fish)).filter(Boolean))
      .children(narrow ? [] : GLINTS.map(([fx, fy, len, period], i) =>
        div().id(`${key}-glint${i}`).absolute().left(Math.round(fx * w)).top(Math.round(fy * h)).w(Math.max(2, z(len))).h(1)
          .bg(water.glint).loop("opacity", { from: 0.04, to: 0.28, period })))
      .when(!narrow, (el) => el
        .child(image(art("reeds.svg")).absolute().left(w - z(39)).top(h - z(89)).w(z(49)).h(z(63)))
        .child(image(art("lily-bank.svg")).absolute().left(0).top(0).w(z(82)).h(z(51)).rounded_tl(radius(w, h)))
        .child(image(art("lily-bank-right.svg")).absolute().left(w - z(78)).top(h - z(58)).w(z(78)).h(z(58)).rounded_br(radius(w, h))))
      .children(pads.map(([file, size, x, y, period], i) =>
        image(art(file)).id(`${key}-pad${i}`).absolute().left(x).top(y).size(size)
          .loop("top", { from: y * scale, to: (y + 1) * scale, period })))
      .when(!narrow, (el) => el.child(
        div().id(`${key}-petal`).absolute().w(2).h(2).bg("#d4e8bd").opacity(0.7)
          .loop("left", { from: Math.round(w * 0.12) * scale, to: Math.round(w * 0.86) * scale, period: 43000 })
          .loop("top", { from: Math.round(h * 0.16) * scale, to: Math.round(h * 0.72) * scale, period: 27000 })))
      .children(sunlight(w, h, new Date()))
      .children(this.ripples.flatMap((ripple) => RIPPLES[ripple.kind].rings.map((spec) => this.ring(ripple, spec, water.ripple))))
      .child(div().absolute().left(0).top(0).size_full().rounded(ROUND).border(1).border_color(t.border));
  }
}
