# Changelog

Format prati [Keep a Changelog](https://keepachangelog.com/), verzije prate [SemVer](https://semver.org/).

## [1.7.0] · 2026-09-04

### Dodato
- Na ekranima od 1240 px naviše, sa obe strane popup-a stoji kartica suseda: poglavlje, naziv jela i oznaka tastera
- Kartica se pomera ka popup-u pri prelazu mišem, u boji svog poglavlja

### Promenjeno
- Na tim ekranima traka na dnu popup-a zadržava samo redni broj, jer nazive preuzimaju bočne kartice

## [1.6.0] · 2026-09-04

### Dodato
- Listanje kroz jela iz otvorenog popup-a, strelicama na dnu i tasterima levo i desno
- Traka pokazuje naziv prethodnog i sledećeg jela i redni broj u nizu
- Kad listanje pređe granicu strane, lista iza popup-a prelazi na tu stranu

### Popravljeno
- Popup više ne dobija plavi obrub kad primi fokus

## [1.5.0] · 2026-09-04

### Dodato
- Paginacija: kad rezultat ima više od 27 kartica, deli se na strane po 15
- Strane rade i kad je ostava uključena, brojanje ide kroz sve grupe, a naslov grupe se ponavlja na strani na kojoj se ta grupa nastavlja
- Svaka promena pretrage, kategorije, oznake ili ostave vraća prikaz na prvu stranu

## [1.4.0] · 2026-09-04

### Dodato
- Pločice u legendi ulaze jedna za drugom, sa blagim odskokom
- Svaka ikonica u legendi ima svoj pokret: klas se ljulja, list niče, mesec lebdi, papričica poskoči, sat se okrene do dvanaest
- Prelaz mišem podiže pločicu i ponavlja pokret ikonice

## [1.3.1] · 2026-09-04

### Dodato
- `og:image:secure_url` i `link rel="image_src"`, koje traže stariji čitači linkova u Viberu i Skypeu

## [1.3.0] · 2026-09-04

### Dodato
- Meta podaci za deljenje na društvenim mrežama: naslov, opis sa podacima o autorki i jelovniku, Open Graph i Twitter kartica
- Slika za deljenje 1200×630 sa nagnutim karticama recepata (`assets/og-card.png`)
- Favicon sa zelenim listom, providna pozadina, znak popunjava celu površinu (`assets/favicon.svg`, PNG od 32 px, Apple touch ikonica od 180 px)
- Kanonski link i ime autorke u meta podacima

## [1.2.1] · 2026-09-04

### Promenjeno
- Legenda ikonica je prepakovana u pločice: ikonica, naziv i objašnjenje ispod njega, bez znaka „—"
- Ulaz kartica traje jednu sekundu, sa razmakom od 55 ms između susednih kartica
- Iz naslova stranice i zaglavlja fajlova uklonjen znak „—"

## [1.2.0] · 2026-09-04

### Dodato
- Legenda iznad filtera objašnjava šta znači svaka ikonica na karticama jela

### Promenjeno
- Ulaz kartica je usporen i ublažen, sa dužim razmakom između njih
- Ime autorke u podnožju vodi na njen Instagram, otvara se u novom tabu

### Uklonjeno
- Sekcija „Jelovnik napravio" iz podnožja
- Vidljiva traka za skrolovanje u popup-u recepta, skrolovanje i dalje radi

## [1.1.0] · 2026-09-04

Doterivanje mobilne verzije i jasnoće interfejsa.

### Dodato
- Podnožje sa podacima o autorki recepata i o tome ko je napravio jelovnik
- Kartice ulaze stepenasto pri svakoj promeni pretrage ili filtera
- Fade na dnu popup-a nagoveštava da tekst ide dalje

### Promenjeno
- Popup recepta na telefonu više ne lepi za ivice, ima razmak od 12 px sa svih strana i poštuje safe area
- Dugme za zatvaranje popup-a ostaje na mestu dok se sadržaj skroluje, i veće je za prst
- „Šta imam kod kuće" sada ima zeleno dugme Otvori/Zatvori sa strelicom, obojen okvir i hover, pa se vidi da je panel klikabilan

### Popravljeno
- Atribut `hidden` više ne gubi bitku sa `display` pravilima, pa se dugme za brisanje pretrage skriva kad je polje prazno
- Skriveni checkbox u listi sastojaka ukotvljen je u svoju oznaku

## [1.0.0] · 2026-09-04

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
- „Šta imam kod kuće": čekiranje sastojaka rangira jela u grupe: može odmah, fali jedan sastojak, fali dva, fali više
- Izbor sastojaka se pamti u browseru
- Rangirana lista najkorišćenijih sastojaka, klik otvara sva jela sa tim sastojkom
- Detalj recepta sa deep linkom, unakrsne veze između povezanih recepata
- Vizuelni identitet preuzet iz knjige: krem papir, rukopisni naslovi, lukovi sa razdelnih strana, boje poglavlja

### Poznata ograničenja
- Bez fotografija jela u ovoj verziji
- Šest nedoumica iz knjige čeka potvrdu autorke, spisak je u `data/review.md`
