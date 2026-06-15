from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import math, random, os

W = 1080
H = 1080

img = Image.new("RGB", (W, H), (0, 0, 0))
draw = ImageDraw.Draw(img, "RGBA")

def gradient_bg(draw, w, h):
    for y in range(h):
        t = y / h
        r = int(8 + 0 * t)
        g = int(15 + 10 * t)
        b = int(45 + 80 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

gradient_bg(draw, W, H)

def particles(draw, w, h, count=300):
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, int(h * 0.9))
        s = random.choice([1, 2, 3])
        alpha = random.randint(30, 180)
        c = (100 + random.randint(0, 155), 180 + random.randint(0, 75), 255, alpha)
        draw.ellipse([x-s, y-s, x+s, y+s], fill=c)

particles(draw, W, H)

def neural_connections(draw, w, h, count=40):
    nodes = [(random.randint(0, w), random.randint(0, int(h * 0.85))) for _ in range(count)]
    for i, (x1, y1) in enumerate(nodes):
        draw.ellipse([x1-4, y1-4, x1+4, y1+4], fill=(0, 200, 255, 200))
        for j in range(i+1, count):
            x2, y2 = nodes[j]
            dist = math.hypot(x2-x1, y2-y1)
            if dist < 250 and random.random() < 0.3:
                alpha = max(0, int(150 * (1 - dist/250)))
                draw.line([(x1, y1), (x2, y2)], fill=(0, 180, 255, alpha), width=1)

neural_connections(draw, W, H)

def glowing_circle(draw, cx, cy, r, color, layers=12):
    for i in range(layers, 0, -1):
        t = i / layers
        cr = int(r * t)
        alpha = int(40 * (1 - t))
        draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=(*color, alpha))

def hexagon(draw, cx, cy, r, color, alpha=180, rotation=0):
    pts = []
    for i in range(6):
        a = math.radians(60 * i + rotation)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    draw.polygon(pts, fill=(*color, alpha), outline=(*color, min(255, alpha+40)))

for i in range(3):
    a = random.randint(0, 359)
    r = 60 + 40 * i
    color = (0, 180 + 40 * i, 255)
    hexagon(draw, W//2 + random.randint(-300, 300), int(H * 0.35) + random.randint(-100, 100), r, color, 30, a)

cx, cy = W//2, int(H * 0.4)
for r in [220, 180, 140, 100]:
    color = (0, 150, 255) if r > 150 else (0, 200, 255) if r > 120 else (100, 220, 255)
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(*color, 60 + 40 * (r//50)), width=2)

for a in range(0, 360, 45):
    rad = math.radians(a)
    x = cx + 200 * math.cos(rad)
    y = cy + 200 * math.sin(rad)
    for s in [3, 2, 1]:
        draw.ellipse([x-s, y-s, x+s, y+s], fill=(0, 220, 255, 200 - 50 * s))

for rad in range(0, 360, 15):
    r = math.radians(rad)
    x1 = cx + 60 * math.cos(r)
    y1 = cy + 60 * math.sin(r)
    x2 = cx + 230 * math.cos(r)
    y2 = cy + 230 * math.sin(r)
    alpha = int(80 + 80 * math.sin(math.radians(rad * 2)))
    draw.line([(x1, y1), (x2, y2)], fill=(0, 200, 255, alpha), width=1)

shield_pts = [
    (cx - 260, cy + 80), (cx - 280, cy - 20), (cx - 240, cy - 100),
    (cx - 120, cy - 160), (cx, cy - 180), (cx + 120, cy - 160),
    (cx + 240, cy - 100), (cx + 280, cy - 20), (cx + 260, cy + 80),
    (cx, cy + 120), (cx - 260, cy + 80)
]
draw.polygon(shield_pts, outline=(0, 180, 255, 80), width=3)
draw.polygon([(x-10, y+10) for x, y in shield_pts], outline=(0, 220, 255, 40), width=2)

brain_pts = [
    (cx-40, cy-50), (cx-20, cy-70), (cx, cy-60), (cx+20, cy-70),
    (cx+40, cy-50), (cx+50, cy-20), (cx+40, cy+10), (cx+20, cy+30),
    (cx, cy+40), (cx-20, cy+30), (cx-40, cy+10), (cx-50, cy-20)
]
draw.polygon(brain_pts, outline=(0, 200, 255, 150), width=2)
draw.polygon([(x-5, y-5) for x, y in brain_pts], outline=(100, 220, 255, 80), width=1)
for pt in brain_pts:
    draw.ellipse([pt[0]-3, pt[1]-3, pt[0]+3, pt[1]+3], fill=(0, 220, 255, 200))

def lightning_bolt(draw, x, y, size=60, color=(0, 200, 255)):
    pts = [
        (x, y-size), (x+size//4, y-size//4), (x+size//8, y-size//4),
        (x+size//2, y+size//8), (x+size//4, y+size//8),
        (x+size//3, y+size), (x-size//8, y+size//4),
        (x, y+size//4), (x-size//2, y-size//8), (x-size//6, y-size//4),
        (x-size//4, y-size//4)
    ]
    draw.polygon(pts, fill=(*color, 120), outline=(*color, 200))

lightning_bolt(draw, cx - 220, int(H * 0.1), 50)
lightning_bolt(draw, cx + 220, int(H * 0.15), 40)
lightning_bolt(draw, cx + 180, int(H * 0.6), 35)
lightning_bolt(draw, cx - 180, int(H * 0.55), 45)

for _ in range(80):
    x = random.randint(0, W)
    y = random.randint(0, int(H * 0.88))
    bw = random.randint(1, 4)
    bh = random.randint(1, 20)
    alpha = random.randint(5, 30)
    draw.rectangle([x, y, x+bw, y+bh], fill=(0, 180, 255, alpha))

font_large = None
font_medium = None
font_small = None

font_paths = [
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\Arial.ttf",
    "C:\\Windows\\Fonts\\tahoma.ttf",
    "C:\\Windows\\Fonts\\Tahoma.ttf",
    "C:\\Windows\\Fonts\\segoeuib.ttf",
    "C:\\Windows\\Fonts\\segoeui.ttf",
]

for fp in font_paths:
    if os.path.exists(fp):
        try:
            font_large = ImageFont.truetype(fp, 140)
            font_medium = ImageFont.truetype(fp, 48)
            font_small = ImageFont.truetype(fp, 26)
        except:
            pass
        break

if font_large is None:
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

def draw_glow_text(draw, xy, text, font, fill, glow_color, glow_radius=6):
    x, y = xy
    for dx in range(-glow_radius, glow_radius+1, 2):
        for dy in range(-glow_radius, glow_radius+1, 2):
            if dx*dx + dy*dy <= glow_radius*glow_radius:
                draw.text((x+dx, y+dy), text, font=font, fill=glow_color)
    draw.text((x, y), text, font=font, fill=fill)

num_text = "4.8"
num_bbox = draw.textbbox((0, 0), num_text, font=font_large)
num_w = num_bbox[2] - num_bbox[0]
num_x = (W - num_w) // 2
num_y = int(H * 0.3)

for r in range(8, 0, -1):
    glow = (0, 80 + 30 * r, 180 + 10 * r, 60 - 5 * r)
    for dx in range(-r*2, r*2+1, max(1, r//2)):
        for dy in range(-r*2, r*2+1, max(1, r//2)):
            if dx*dx + dy*dy <= (r*2)*(r*2):
                draw.text((num_x+dx, num_y+dy), num_text, font=font_large,
                          fill=(*glow,), stroke_width=0)

draw.text((num_x, num_y), num_text, font=font_large,
          fill=(200, 240, 255), stroke_width=3, stroke_fill=(0, 100, 200))

for dx, dy in [(0, 5), (0, -5)]:
    pass

for a in range(0, 360, 30):
    r = math.radians(a)
    x = cx + 280 * math.cos(r)
    y = cy + 280 * math.sin(r)
    if a % 90 == 0:
        draw.ellipse([x-8, y-8, x+8, y+8], fill=(0, 220, 255, 200), outline=(100, 230, 255, 150), width=2)
    else:
        draw.ellipse([x-4, y-4, x+4, y+4], fill=(0, 200, 255, 150))

eng_text = "Opus 4.8"
arabic_text = "ثورة الذكاء في التجارة الإلكترونية"

if font_medium:
    et_bbox = draw.textbbox((0, 0), eng_text, font=font_medium)
    et_w = et_bbox[2] - et_bbox[0]
    draw.text(((W - et_w) // 2, int(H * 0.62)), eng_text, font=font_medium,
              fill=(180, 220, 255), stroke_width=1, stroke_fill=(0, 80, 180))

if font_small:
    at_bbox = draw.textbbox((0, 0), arabic_text, font=font_small)
    at_w = at_bbox[2] - at_bbox[0]
    draw.text(((W - at_w) // 2, int(H * 0.7)), arabic_text, font=font_small,
              fill=(180, 220, 255), stroke_width=0)

tagline = "AI-Powered E-Commerce Intelligence"
if font_small:
    tg_bbox = draw.textbbox((0, 0), tagline, font=font_small)
    tg_w = tg_bbox[2] - tg_bbox[0]
    draw.text(((W - tg_w) // 2, int(H * 0.76)), tagline, font=font_small,
              fill=(100, 200, 255, 200))

img_rgba = img.convert("RGBA")
black_strip = Image.new("RGBA", (W, int(H * 0.1)), (0, 0, 0, 255))
img_rgba.paste(black_strip, (0, H - int(H * 0.1)))
img = img_rgba

# feather overlay
overlay = Image.new("RGBA", (W, int(H * 0.1)), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
for y in range(int(H * 0.1)):
    t = y / int(H * 0.1)
    alpha = int(120 * (1 - t))
    od.line([(0, y), (W, y)], fill=(0, 100, 255, alpha))
img.paste(overlay, (0, H - int(H * 0.1)), overlay)

glow_overlay = Image.new("RGBA", (W, int(H * 0.15)), (0, 0, 0, 0))
god = ImageDraw.Draw(glow_overlay)
for y in range(int(H * 0.15)):
    t = y / int(H * 0.15)
    alpha = int(60 * t)
    god.line([(0, y), (W, y)], fill=(0, 120, 255, alpha))
img.paste(glow_overlay, (0, int(H * 0.85)), glow_overlay)

img = img.convert("RGB")
out_path = r"C:\Users\ELHEGAWY 7\Desktop\my-next-app\opus48_promo.png"
img.save(out_path, "PNG", quality=95)
print(f"Image saved to {out_path}")
print(f"Size: {img.size}")
