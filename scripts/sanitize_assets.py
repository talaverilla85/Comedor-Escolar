#!/usr/bin/env python3
"""Sanitize legacy cafeteria tray and food cutouts.

The generated source sheet contained fake checkerboard transparency:
its grey/white squares were embedded in the opaque pixels.  Derive
a clean cutout library and liquid textures. Never change menu data.
Requires Pillow, NumPy, opencv-python-headless.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "assets"
OUT = ROOT / "public" / "assets-clean"
OUT.mkdir(parents=True, exist_ok=True)

SOUPS = (
    "crema-naranja", "crema-verde", "lentejas", "garbanzos",
    "judias", "potaje-verduras", "sopa-vegetal",
    "sopa-pollo", "sopa-pescado", "caldo-arroz",
)

def get(name):
    return np.array(Image.open(SRC / f"{name}.png").convert("RGBA"))

def save(name, rgba):
    Image.fromarray(rgba.astype("uint8"), "RGBA").save(OUT / f"{name}.png", optimize=True)

for color in ("azul", "roja"):
    name = f"bandeja-{color}"
    rgba = get(name)
    c = rgba[:, :, :3].astype(np.int16)
    r, g, b = c[:, :, 0], c[:, :, 1], c[:, :, 2]
    if color == "azul":
        m = ((b - r > 20) & (b - g > 9) & (g - r > 12)).astype("uint8") * 255
    else:
        m = ((r - g > 21) & (r - b > 17)).astype("uint8") * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    silhouette = np.zeros(m.shape, "uint8")
    cv2.drawContours(silhouette, [max(contours, key=cv2.contourArea)], -1, 255, -1)
    silhouette = cv2.GaussianBlur(silhouette, (5, 5), .7)
    # Checkerboard painted OUTSIDE the tray has neutral grey/white pixels.
    # Remove them without cutting into blue or red molded plastic highlights.
    neutral = (c.max(axis=2)-c.min(axis=2)<28) & (c.min(axis=2)>148)
    silhouette[neutral] = 0
    rgba[:, :, 3] = silhouette
    save(name, rgba)

for name in SOUPS:
    rgba = get(name)
    h, w = rgba.shape[:2]
    rgb = rgba[:, :, :3]
    max_channel = rgb.max(axis=2).astype(int)
    min_channel = rgb.min(axis=2).astype(int)
    yy, xx = np.mgrid[:h, :w]
    ellipse = ((xx - (w-1)*.5)/(w*.465))**2 + ((yy - (h-1)*.53)/(h*.472))**2 < 1
    checker = ((max_channel - min_channel < 22) & (min_channel > 177)) | (rgba[:, :, 3] < 235)
    damaged = ((checker & ellipse) * 255).astype("uint8")
    clean = cv2.inpaint(rgb, damaged, 7, cv2.INPAINT_TELEA)
    alpha_img = Image.new("L", (w * 4, h * 4))
    ImageDraw.Draw(alpha_img).ellipse(
        (int(w*4*.035), int(h*4*.057), int(w*4*.965), int(h*4*.995)), fill=255
    )
    alpha = np.asarray(alpha_img.resize((w,h), Image.Resampling.LANCZOS))
    save(name, np.dstack((clean, alpha)))
    # Opaque food SURFACE for the well's irregular mask; never show a bowl,
    # floating circle or embedded checkerboard.
    inner = clean[int(h*.13):int(h*.89), int(w*.13):int(w*.88)]
    texture = cv2.resize(inner, (512, 320), interpolation=cv2.INTER_CUBIC)
    save(f"surface-{name}", np.dstack((texture, np.full((320,512),255,dtype="uint8"))))

# Keep solids as source cutouts. Remove checkerboard only from colored fruit
# and bread, where a chromatic selection is reliable.
for name in ("fruta", "pan"):
    rgba = get(name)
    rgb = rgba[:,:,:3].astype(np.int16)
    delta = rgb.max(2) - rgb.min(2)
    foreground = (delta > 23).astype("uint8") * 255
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, np.ones((7,7),dtype="uint8"))
    contours, _ = cv2.findContours(foreground, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros(foreground.shape,dtype="uint8")
    if contours:
        cv2.drawContours(mask,[c for c in contours if cv2.contourArea(c)>80],-1,255,-1)
    mask = cv2.GaussianBlur(mask,(5,5),.65)
    rgba[:,:,3] = np.minimum(rgba[:,:,3],mask)
    save(name,rgba)

# The old cutlery image is diagonal already: the website must not rotate it.
# The whitish paper napkin behind it was mistaken for transparency in the
# generated sheet. Make the affected neutral pixels uniform off-white.
rgba = get("cubiertos")
rgb = rgba[:,:,:3]
h,w = rgb.shape[:2]
yy,xx = np.mgrid[:h,:w]
napkin = (xx > 42) & (xx < 120) & (yy > 75) & (yy < 202)
neutral = (rgb.max(2).astype(int)-rgb.min(2).astype(int)<18) & (rgb.min(2)>190)
rgba[napkin & neutral, :3] = (244,244,241)
save("cubiertos",rgba)
print(f"Processed {len(list(OUT.glob('*.png')))} assets into {OUT}")
