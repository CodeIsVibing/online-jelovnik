#!/usr/bin/env python3
"""Merge per-scan raw records into the site data files and validate them."""
import json, glob, os, collections

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")

def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)

def save(name, obj):
    with open(os.path.join(DATA, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

categories = load("categories.json")
ingredients = load("ingredients.json")
order = {c["id"]: c["order"] for c in categories}

records = []
for path in sorted(glob.glob(os.path.join(DATA, "raw", "*.json"))):
    records.extend(json.load(open(path, encoding="utf-8")))

records.sort(key=lambda r: (order[r["category"]], r["source"]["scan"], r["source"]["page"]))
for r in records:
    r.setdefault("type", "recept")

ing_ids = {i["id"] for i in ingredients}
cat_ids = {c["id"] for c in categories}
rec_ids = {r["id"] for r in records}

errors = []
seen = collections.Counter(r["id"] for r in records)
errors += [f"duplicate recipe id: {k}" for k, v in seen.items() if v > 1]
for r in records:
    if r["category"] not in cat_ids:
        errors.append(f"{r['id']}: unknown category {r['category']}")
    for item in r["ingredients"]:
        if item["ref"] not in ing_ids:
            errors.append(f"{r['id']}: unknown ingredient {item['ref']}")
    # resolve cross-references to real recipes, drop the ones with no target
    if "seeAlso" in r:
        r["seeAlso"] = [s for s in r["seeAlso"] if s in rec_ids]
        if not r["seeAlso"]:
            del r["seeAlso"]

# usage counts drive the "most used ingredients" view; basics are excluded there
usage = collections.Counter(
    item["ref"] for r in records for item in r["ingredients"] if not item.get("optional")
)
for i in ingredients:
    i["count"] = usage.get(i["id"], 0)
ingredients.sort(key=lambda i: (-i["count"], i["title"]))

save("recipes.json", records)
save("ingredients.json", ingredients)

print(f"zapisa: {len(records)}  sastojaka: {len(ingredients)}")
print("greške:", errors if errors else "nema")
print("\npo kategorijama:")
by_cat = collections.Counter(r["category"] for r in records)
for c in sorted(categories, key=lambda c: c["order"]):
    print(f"  {by_cat.get(c['id'], 0):3d}  {c['title']}")
print("\nnajčešći sastojci (bez osnovnih):")
for i in [x for x in ingredients if not x.get("basic")][:15]:
    print(f"  {i['count']:3d}x  {i['title']}")
unused = [i["title"] for i in ingredients if i["count"] == 0]
print("\nnekorišćeni sastojci:", unused if unused else "nema")
