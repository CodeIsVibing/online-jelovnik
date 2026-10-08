"""Helpers for transcribing book pages into data/raw/*.json by hand."""
import json, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


def I(raw, ref, qty=None, unit=None, group=None, optional=False):
    d = {"raw": raw}
    if qty is not None: d["qty"] = qty
    if unit is not None: d["unit"] = unit
    d["ref"] = ref
    if group: d["group"] = group
    if optional: d["optional"] = True
    return d


def R(rid, title, cat, scan, page, printed, ings, method, *, sub=None, t=None, timeNote=None,
      servings=None, servingsMax=None, tags=(), nutri=None, notes=None, tips=None, book="imunomania-2", prefix="i2-"):
    r = {"id": prefix + rid, "title": title, "type": "recept", "book": book, "category": cat,
         "source": {"scan": scan, "page": page, "printed": printed}, "tags": list(tags),
         "notes": notes or [], "ingredients": ings, "method": method, "tips": tips or []}
    if sub: r["subtitle"] = sub
    if t is not None: r["timeMinutes"] = t
    if timeNote: r["timeNote"] = timeNote
    if servings is not None: r["servings"] = servings
    if servingsMax is not None: r["servingsMax"] = servingsMax
    if nutri:
        keys = ["kcal", "carbs", "fat", "protein", "fiber"]
        r["nutrition"] = {k: v for k, v in zip(keys, nutri) if v is not None}
    return r


def save(scan, recs, prefix="i2-s"):
    """Merge records into the per-scan raw file, replacing any with the same id."""
    p = f"{BASE}/raw/{prefix}{scan:03d}.json"
    old = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else []
    ids = {r["id"] for r in recs}
    merged = [r for r in old if r["id"] not in ids] + recs
    json.dump(merged, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def add_ing(*items):
    p = f"{BASE}/ingredients.json"
    ing = json.load(open(p, encoding="utf-8"))
    have = {i["id"] for i in ing}
    for it in items:
        if it["id"] not in have:
            it.setdefault("aliases", []); it["count"] = 0; ing.append(it)
    json.dump(ing, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
