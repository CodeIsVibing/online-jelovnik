# Changelog

Format prati [Keep a Changelog](https://keepachangelog.com/), verzije prate [SemVer](https://semver.org/).

## [1.0.0] — 2026-09-04

Prva verzija. Kompletan sadržaj kuvara „Imunomania" prebačen u pretraživ onlajn jelovnik.

### Podaci
- Transkribovana sva 83 skena knjige, ukupno 174 zapisa: 145 recepata i 29 tekstualnih saveta
- 170 normalizovanih sastojaka sa sinonimima iz knjige, npr. „golica" vodi na bundevine semenke
- 8 kategorija iz sadržaja knjige, sa originalnim bojama poglavlja
- Oznake preuzete sa ikonica: bez glutena (107), vegetarijansko (86), priprema veče ranije (14), ljuto (6)
- So, biber, voda, ulje, maslinovo ulje i led označeni kao podrazumevani, pa ne traže čekiranje
- `build.py` spaja zapise po skenu iz `data/raw/` i proverava sve veze

### Sajt
- Pretraga po naslovu, sastojcima, postupku i savetima, radi i bez dijakritike („sampinjoni" nalazi „šampinjoni")
- Pregled po kategorijama i filter po oznakama
- „Šta imam kod kuće": čekiranje sastojaka rangira jela u grupe — može odmah, fali jedan sastojak, fali dva, fali više
- Izbor sastojaka se pamti u browseru
- Rangirana lista najkorišćenijih sastojaka, klik otvara sva jela sa tim sastojkom
- Detalj recepta sa deep linkom, unakrsne veze između povezanih recepata
- Vizuelni identitet preuzet iz knjige: krem papir, rukopisni naslovi, lukovi sa razdelnih strana, boje poglavlja

### Poznata ograničenja
- Bez fotografija jela u ovoj verziji
- Šest nedoumica iz knjige čeka potvrdu autorke, spisak je u `data/review.md`
