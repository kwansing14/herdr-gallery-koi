import math
import shutil
import subprocess
import xml.etree.ElementTree as ET
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

ART = Path(__file__).resolve().parents[1] / 'mods' / 'koi'
OUT = ART / 'sprites'
MANIFEST = ART / 'sprites.js'
NEAREST = Image.Resampling.NEAREST
TAU = math.tau
ZOOM = .55
HEADINGS = 16
FRAMES = 20
GAITS = {'cruise': (.55, 76), 'brisk': (.68, 60), 'coast': (.18, 118)}
BENDS = {'cruise': True, 'brisk': True, 'coast': False}
BEND = .42
HEAD = 19
PALETTE = ['#000000', '#071b27', '#dee8df', '#7e9da5', '#f2f4e5', '#cb4e60', '#27333e', '#27343b', '#d7b058', '#997142', '#f0ce7b', '#afc4be', '#deb8bd', '#e7ecdf']
FISH = [
    {'name': 'kohaku', 'scale': .88, 'phase': .03, 'body': '#dee8df', 'shade': '#7e9da5', 'light': '#f2f4e5', 'marks': [('koi-hi.svg', '#cb4e60')]},
    {'name': 'ogon', 'scale': .76, 'phase': .38, 'body': '#d7b058', 'shade': '#997142', 'light': '#f0ce7b', 'marks': []},
    {'name': 'sanke', 'scale': .8, 'phase': .7, 'body': '#dee8df', 'shade': '#7e9da5', 'light': '#f2f4e5', 'marks': [('koi-hi.svg', '#cb4e60'), ('koi-sumi.svg', '#27333e')]},
    {'name': 'tancho', 'scale': .66, 'phase': .52, 'body': '#dee8df', 'shade': '#7e9da5', 'light': '#f2f4e5', 'marks': [('koi-tancho.svg', '#cb4e60')]},
]


def source_sprite(fish):
    parts = []
    layers = [('koi-body.svg', fish['body']), ('koi-shade.svg', fish['shade']), *fish['marks'], ('koi-light.svg', fish['light']), ('koi-eye.svg', '#27343b')]
    for name, color in layers:
        root = ET.fromstring((ART / name).read_text())
        for node in root.iter():
            if node.get('fill') == '#fff':
                node.set('fill', color)
        parts.extend(ET.tostring(node, encoding='unicode') for node in root)
    source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 5 52 34" width="52" height="34">' + ''.join(parts) + '</svg>'
    rendered = subprocess.run(['rsvg-convert'], input=source.encode(), stdout=subprocess.PIPE, check=True).stdout
    sprite = Image.open(BytesIO(rendered)).convert('RGBA')
    fins = []
    body = sprite.copy()
    for polygon, pivot in [
        ([(32, 11), (28, 11), (28, 7), (24, 7), (24, 3), (28, 3), (28, 5), (32, 5), (32, 7), (36, 7), (36, 11)], (34, 11)),
        ([(34, 23), (30, 23), (30, 27), (26, 27), (26, 31), (30, 31), (30, 29), (34, 29), (34, 27), (38, 27), (38, 23)], (36, 23)),
    ]:
        mask = Image.new('L', sprite.size)
        ImageDraw.Draw(mask).polygon(polygon, fill=255)
        fin = sprite.copy()
        fin.putalpha(ImageChops.multiply(sprite.getchannel('A'), mask))
        body.putalpha(ImageChops.subtract(body.getchannel('A'), mask))
        fins.append((fin, pivot))
    return body, fins


def indexed(frame, palette):
    converted = frame.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE)
    alpha = frame.getchannel('A')
    converted.paste(0, mask=alpha.point(lambda v: 255 if v < 100 else 0))
    converted.info['transparency'] = 0
    return converted


def scale_of(fish):
    return fish['scale'] * ZOOM


def size_of(fish):
    size = math.ceil(math.hypot(64, 54) * scale_of(fish)) + 6
    return size + size % 2


def swimming(sprite, fish, beat, effort, turn=0):
    body, fins = sprite
    layer = Image.new('RGBA', body.size)
    for side, (fin, pivot) in enumerate(fins):
        spread = math.sin(beat*.5 + side*.9 + fish['phase']*TAU)
        angle = (1 if side else -1)*(10 + 21*spread*effort) - turn*18
        layer.alpha_composite(fin.rotate(angle, resample=NEAREST, center=pivot))
    layer.alpha_composite(body)
    bent = Image.new('RGBA', (64, 54))
    for x in range(layer.width):
        tail = max(0, min(1, (43-x)/41))
        bend = math.sin(beat-tail*4.2) * (2.1 + 4.4*effort) * tail**1.7 + turn*tail**1.8*12
        bent.alpha_composite(layer.crop((x, 0, x+1, layer.height)), (x+6, 10+round(bend)))
    scale = scale_of(fish)
    return bent.resize((round(64*scale), round(54*scale)), NEAREST)


def frame(pose, heading, size):
    turned = pose.rotate(-math.degrees(heading), resample=NEAREST, expand=True)
    canvas = Image.new('RGBA', (size, size))
    at = ((size - turned.width)//2, (size - turned.height)//2)
    shadow = Image.new('RGBA', turned.size, '#071b27')
    shadow.putalpha(turned.getchannel('A'))
    canvas.alpha_composite(shadow, (at[0]+2, at[1]+3))
    canvas.alpha_composite(turned, at)
    return canvas


def tight(size, frames):
    center = size // 2
    reach = 0
    for f in frames:
        box = f.getbbox()
        if box:
            reach = max(reach, center - box[0], box[2] - center, center - box[1], box[3] - center)
    return (center - reach, center - reach, center + reach, center + reach)


def build():
    palette = Image.new('P', (1, 1))
    colors = [int(c[i:i+2], 16) for c in PALETTE for i in [1, 3, 5]]
    palette.putpalette(colors + [0]*(768-len(colors)))
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    manifest = []
    total = 0
    count = 0
    for fish in FISH:
        sprite = source_sprite(fish)
        size = size_of(fish)
        sheets = {}
        for gait, (effort, ms) in GAITS.items():
            bends = [('', 0)] + ([('-left', -BEND), ('-right', BEND)] if BENDS[gait] else [])
            for suffix, turn in bends:
                poses = [swimming(sprite, fish, TAU*2*i/FRAMES, effort, turn) for i in range(FRAMES)]
                for h in range(HEADINGS):
                    heading = TAU*h/HEADINGS
                    frames = [indexed(frame(p, heading, size), palette) for p in poses]
                    sheets[f"{fish['name']}-{gait}{suffix}-{h:02d}.gif"] = (frames, ms)
        box = tight(size, [f for frames, _ in sheets.values() for f in frames])
        for name, (frames, ms) in sheets.items():
            frames = [f.crop(box) for f in frames]
            path = OUT / name
            frames[0].save(path, save_all=True, append_images=frames[1:], duration=ms, loop=0, disposal=2, transparency=0, optimize=True)
            total += path.stat().st_size
            count += 1
        manifest.append(f"  {fish['name']}: {{ size: {box[2] - box[0]}, head: {round(HEAD*scale_of(fish))} }},")
    MANIFEST.write_text(f"export const HEADINGS = {HEADINGS};\nexport const SPRITES = {{\n" + "\n".join(manifest) + "\n};\n")
    print(f'{count} sprites, {total:,} bytes')


if __name__ == '__main__':
    build()
