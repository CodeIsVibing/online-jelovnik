# izrezuje zelenu traku sa ikonicama sa polustrane knjige 2 i uvećava je
import sys
from PIL import Image
import numpy as np

def strip(path, out, scale=2.4):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    top = a[: int(h * 0.62)]
    r, g, b = top[..., 0], top[..., 1], top[..., 2]
    mask = (abs(r - 100) < 22) & (abs(g - 124) < 22) & (abs(b - 50) < 26)
    # traka je uska i visoka, pa tražimo kolonu sa najviše zelenih piksela
    cols = mask.sum(axis=0)
    if cols.max() < 120:
        return False
    best = int(cols.argmax())
    lo = best
    while lo > 0 and cols[lo - 1] > cols.max() * 0.35: lo -= 1
    hi = best
    while hi < w - 1 and cols[hi + 1] > cols.max() * 0.35: hi += 1
    rows = mask[:, lo:hi + 1].sum(axis=1)
    ys = np.where(rows > (hi - lo + 1) * 0.3)[0]
    if len(ys) == 0: return False
    y0, y1 = int(ys.min()), int(ys.max())
    crop = im.crop((max(lo - 6, 0), max(y0 - 6, 0), min(hi + 6, w), min(y1 + 6, h)))
    crop = crop.resize((int(crop.width * scale), int(crop.height * scale)), Image.LANCZOS)
    crop.save(out)
    return True

if __name__ == "__main__":
    print(strip(sys.argv[1], sys.argv[2]))
