# Online Jelovnik

Podaci izvučeni iz kuvara „Imunomania" autorke Nastasje Nedimović, pripremljeni za
pretragu jela, pregled po kategorijama i filter po sastojcima koje korisnik ima kod kuće.

## Fajlovi

```
data/
├── recipes.json      — 174 zapisa (145 recepata + 29 saveta), spojeno iz raw/
├── ingredients.json  — 170 normalizovanih sastojaka sa sinonimima i brojem pojavljivanja
├── categories.json   — 8 kategorija iz sadržaja knjige, sa bojama
├── review.md         — nedoumice i greške u knjizi koje treba proveriti sa autorkom
└── raw/              — po jedan fajl po skenu (sNN.json), izvor istine
build.py              — spaja raw/ u recipes.json i proverava veze
scans/                — 166 uspravljenih polustrana (van gita)
```

Izmene se rade u `data/raw/`, pa se pokrene `python3 build.py`.

## Model zapisa

```json
{
  "id": "proteinska-heljdokasa",
  "title": "Proteinska heljdokaša",
  "type": "recept",
  "category": "dorucak-vecera",
  "source": { "scan": 2, "page": "L" },
  "timeMinutes": 10,
  "tags": ["bez-glutena", "vegetarijansko", "priprema-vece-ranije"],
  "notes": ["bez mlečnih proizvoda i šećera."],
  "ingredients": [
    { "raw": "1 supena kašika sirove golice (bundevino seme)",
      "qty": 1, "unit": "supena kašika", "ref": "bundevine-semenke" }
  ],
  "method": "…",
  "tips": ["…"]
}
```

Opciona polja: `subtitle`, `timeNote`, `equipment`, `seeAlso`, `ingredients[].group`,
`ingredients[].optional`, `source.continuedOn`.

`type` je `recept` ili `savet`. Saveti su tekstualne strane iz poslednjeg poglavlja i
nemaju listu sastojaka.

## Sastojci

`raw` čuva original iz knjige radi prikaza, `ref` pokazuje na normalizovan sastojak i
pokreće filter „šta imam kod kuće". Sastojci sa `basic: true` (voda, so, biber, ulje,
maslinovo ulje, led) podrazumevaju se i ne traže se od korisnika. `aliases` hvata
sinonime iz knjige, npr. „golica" vodi na `bundevine-semenke`.

Stavke sa `optional: true` ne ulaze u broj pojavljivanja i ne kvare poklapanje.

## Oznake

| Oznaka | Ikonica u knjizi | Broj recepata |
|---|---|---|
| `bez-glutena` | precrtano žito | 107 |
| `vegetarijansko` | zeleno „V" sa listom | 86 |
| `priprema-vece-ranije` | mesec sa zvezdicama | 14 |
| `ljuto` | papričica | 6 |
