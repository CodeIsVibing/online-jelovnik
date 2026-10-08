# Online Jelovnik

Podaci izvučeni iz tri kuvara autorke Nastasje Nedimović („Imunomania", „Imunomania 2" i
„Smoothiemania"), pripremljeni za pretragu jela, pregled po knjigama i poglavljima, filter po
sastojcima koje korisnik ima kod kuće i sastojcima koje ne jede, i lični plan ishrane sa
spiskom za kupovinu.

## Fajlovi

```
data/
├── recipes.json      — svi zapisi, spojeno iz raw/
├── ingredients.json  — normalizovani sastojci sa grupom, sinonimima i brojem pojavljivanja
├── categories.json   — poglavlja iz sve tri knjige, sa bojama i redosledom
├── books.json        — tri knjige: naziv, kratak naziv, podnaslov, redosled
├── pitanja-za-autorku.md — strane za ponovni sken i odgovori autorke
└── raw/              — po jedan fajl po skenu, izvor istine (sNN, i2-sNNN, s1NN)
build.py              — spaja raw/ u recipes.json i proverava veze
tools/                — pomoć za ručni unos (unos.py) i proveru ikonica sa štampe (ikonice.py)
TODO.md               — recepti kojima nešto fali i strane koje čekaju nov sken
scans*/               — skenovi knjiga, samo lokalno, nikad u gitu
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

Opciona polja: `book` (podrazumevano `imunomania`), `subtitle`, `timeNote`, `servings`,
`nutrition` (`kcal`, `carbs`, `fat`, `protein`, `fiber`, po porciji), `warning` (napomena sa
znakom upozorenja), `equipment`, `seeAlso`, `ingredients[].group`, `ingredients[].optional`,
`source.printed` (odštampan broj strane), `source.continuedOn`.

## Podaci korisnika

Sve lično živi u `localStorage` pregledača, nikad na serveru: ostava (`imunomania.ostava.v1`),
omiljena (`imunomania.omiljena.v1`), pravio sam (`imunomania.pravio.v1`), ne jedem
(`imunomania.nejedem.v1`), plan ishrane (`imunomania.plan.v1`), kupljeno sa spiska
(`imunomania.kupljeno.v1`) i izbor dizajna (`imunomania.dizajn.v1`).

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
