# Changelog

Format prati [Keep a Changelog](https://keepachangelog.com/), verzije prate [SemVer](https://semver.org/).

## [1.23.0] · 2026-10-08

### Dodato
- Imunomania 2: poglavlje Slatko, svih 30 recepata (strane 152 do 181)
- Imunomania 2: poglavlje Napravi sam, svih 15 recepata (strane 184 do 198), od vegan parmezana do sportskog napitka
- Svi recepti iz knjige 2 su uneti: 155 jela u osam poglavlja. Sajt ukupno ima 400 jela i 39 saveta
- Recepti koji se pozivaju na drugi recept iz knjige (pasta od urmi, pire od bundeve, čokoladni puding) imaju link „Vidi i"
- Novi sastojci: ovseno i pirinčano brašno, speltin griz, muskatni orašćić, grožđe, brusnica, anis, kravlje mleko, sveže bilje

### Za autorku
- U `TODO.md`: ikonice „Zimskog prazničnog napitka" koje se ne slažu sa receptom i „30 do 40 stepeni" u „Klafutiju sa višnjama", na sajtu ispravljeno u minute

## [1.22.0] · 2026-10-08

### Dodato
- Imunomania 2: poglavlje Dresinzi za salate, svih 10 recepata (strane 123 do 132)
- Imunomania 2: poglavlje Hleb, peciva i grickalice, svih 15 recepata (strane 135 do 149)
- Novi sastojci: kamut brašno, laneno brašno, ruzmarin

### Promenjeno
- „Pita hleb" (kamut) i „Susam talasi" (spelta) nose ikonicu „bez glutena" kao u knjizi, uz znak upozorenja da nisu za osobe sa celijakijom, po istom pravilu koje je autorka dala za „Lanene pločice"
- Ikonica sa papričicom u knjizi 2 znači „ljuto" (legenda na strani 7); dresinzi sa senfom je nose kako je odštampano

## [1.21.0] · 2026-10-08

### Dodato
- Imunomania 2: poglavlje Supe i čorbe, svih 6 recepata (strane 94 do 99)
- Imunomania 2: poglavlje Namazi, umaci i sosevi, svih 19 recepata (strane 102 do 120), sa nutritivnim vrednostima
- Porcije odštampane kao raspon („6-8") prikazuju se kao raspon, dok ih korisnik ne promeni
- Novi sastojci: guščija mast, karanfilić

### Za autorku
- U `TODO.md` su dodata dva recepta čije se ikonice ne slažu sa receptom (Brza salsa, Kikiriki umak), Slatki humus sa nutritivnim vrednostima prepisanim od Čokoladnog namaza i Tahini umak bez ikonica

## [1.20.0] · 2026-10-08

### Dodato
- **Moj plan**: novi tab sa sedam dana i četiri obroka, kao u planovima iz knjige 2. U popupu svakog jela biraš dan i obrok i dodaješ ga u plan; jela u planu su linkovi koji otvaraju recept. Za jela sa odštampanim vrednostima dan dobija zbir kalorija, proteina, ugljenih hidrata i masti
- **Spisak za kupovinu** ispod plana: sastojci svih jela iz plana, sabrani po jedinici i grupisani po vrsti, sa jelima kojima trebaju. Ono što je čekirano u ostavi izdvojeno je na kraju. Stavke se štikliraju u prodavnici, a dugme kopira spisak
- **Ne jedem**: panel za sastojke koje korisnik izbegava; jela sa njima se ne prikazuju. Opcioni sastojak ne sakriva jelo
- **Porcije**: kod recepata iz knjige 2 broj porcija se menja dugmadima, a količine u sastojcima se preračunavaju
- **Filter po knjizi**, red čipova iznad poglavlja; poglavlja i oznake broje samo jela iz izabrane knjige
- **Samo naziv**: prekidač u pretrazi koji traži samo u nazivima jela
- Ekran telefona ostaje upaljen dok je recept otvoren, gde pregledač to dozvoljava
- Poglavlja „Dresinzi za salate" i „Napravi sam" za knjigu 2; pojaviće se kad budu uneti prvi recepti

### Promenjeno
- Sastojci su preraspoređeni u 17 grupa; nove su Biljna mleka, Puteri i namazi, Zaslađivači, Proteini u prahu i dodaci, Za pečenje i zgušnjavanje i Sirće, sosevi i bujon. Ostava i spisak za kupovinu ih prikazuju po grupama
- Opis sajta za pretraživače i deljenje pominje sve tri knjige
- Na uskim telefonima traka sa tabovima staje u jedan red, a ukras zaglavlja ne pravi horizontalni skrol

### Pregledano
- Ostatak knjige 2: šest poglavlja recepata, deo Imunitet, dva plana ishrane i „Moje preporuke". Za „Moje preporuke" skenirana je samo naslovna strana, zapisano u `TODO.md`

## [1.19.2] · 2026-10-08

### Promenjeno
- Odgovori autorke na sva otvorena pitanja iz tri knjige su uneti
- „Proteinska slana kaša" je vegetarijanska; legenda sada kaže „bez mesa kopnenih životinja", kako autorka definiše oznaku
- „Lanene pločice" nose oznaku „bez glutena" i upozorenje da sadrže speltu i ječam i da nisu za osobe sa celijakijom
- „Vegeterijanski sendvič" više nema izmišljen postupak, jer ga knjiga nema
- „Humus" ima vreme „Odokativno, po ukusu"
- Đumbir je bio dvaput u rečniku sastojaka, spojen je u jedan

### Dodato
- Znak upozorenja na kartici i u popupu, za recepte sa napomenom koju treba pročitati pre pripreme, i stavka u legendi
- `TODO.md` sa četiri recepta kojima nešto fali i spiskom strana za ponovni sken

### Uklonjeno
- `data/review.md`, odgovori su preneti u `data/pitanja-za-autorku.md`

## [1.19.1] · 2026-10-08

### Bezbednost
- Skenovi druge i treće knjige (`scans-v2/`, `scans-v3/`, 294 slike) bili su od verzije 1.10.0 greškom u repou i javno dostupni preko sajta. Uklonjeni su iz repoa i sa sajta i dodati u `.gitignore`; lokalne kopije su netaknute. Ostaju u istoriji gita dok se istorija ne prepiše.

## [1.19.0] · 2026-10-08

### Dodato
- Imunomania 2, poglavlje Ručak kompletno: svih 30 recepata, strane 62 do 91
- `tools/unos.py` i `tools/ikonice.py`: pomoć za ručni unos i alat koji izrezuje i uvećava zelenu traku sa ikonicama, da se oznake proveravaju sa štampe

### Popravljeno
- Sedam recepata nosilo je „bez kvasca" umesto „bez belog brašna"; ikonica vreće je u legendi knjige brašno. Provereno uvećanjem trake na svakoj strani
- Neodređeno „povrće po želji" u Indijskom jelu ne traži više papriku u ostavi

### Napomena
- „Pečeni pirinač od karfiola": traka nosi i vegan, sirovo i ljuto, što se ne slaže sa receptom; te oznake nisu prenete i zabeležene su za autorku

## [1.18.0] · 2026-10-03

### Dodato
- Imunomania 2, poglavlje Ručak: prvih trinaest od trideset recepata, strane 62 do 74
- Pastomania upućuje na recept za bešamel; veza će se pojaviti kad recept iz dela Namazi i umaci bude unet

### Uklonjeno
- Tri napomene koje nisu autorkine, a stajale su uz njen tekst (objašnjenja kako ostava računa varijante)

## [1.17.0] · 2026-10-03

### Dodato
- Imunomania 2, poglavlje Doručak / večera kompletno: svih 30 recepata, strane 30 do 59

### Promenjeno
- „Zeleni wragan" sa strane 47 nosi naziv iz sadržaja poglavlja, „Zeleni uragan"; razlika je dodata u `data/pitanja-za-autorku.md`

## [1.16.0] · 2026-10-03

### Dodato
- Imunomania 2, poglavlje Doručak / večera: recepti od strane 30 do 44, petnaest od trideset
- Svaki recept nosi porcije, nutritivne vrednosti i oznake iz knjige
- Recepti sa više varijanti (Kaša iz kesice, Jaja mafini) imaju sastojke podeljene po varijantama; za ostavu se računa samo prva

### Napomena
- „45 grama": postupak se u knjizi prekida usred rečenice; prenet je do tog mesta i dodat u `data/pitanja-za-autorku.md`

## [1.15.0] · 2026-10-03

### Dodato
- Podrška za knjigu „Imunomania 2": broj porcija i nutritivne vrednosti (kcal, ugljeni hidrati, masti, proteini, vlakna) u popupu
- Četiri nove oznake iz legende druge knjige: bez šećera, bez belog brašna, bez kvasca, sirovo, sa ikonicama i stavkama u legendi
- Prvi recept druge knjige, „Sirova kaša za oporavak"

### Promenjeno
- Jelo označeno kao vegan automatski dobija i oznaku vegetarijansko, pošto druga knjiga štampa samo vegan
- Redosled unutar poglavlja ide po knjizi, jer se skenovi u svakoj knjizi numerišu ispočetka

## [1.14.0] · 2026-10-03

### Dodato
- Smoothiemania kompletna: svih 100 šejkova, koliko navodi korica knjige
- Poglavlja Senior, Konstipacija i Energy boost
- Uvodi svih šest poglavlja, kao saveti
- Novo poglavlje „Saveti za šejkove": o knjizi sa disklejmerom, napomena za gluten, oprema, zamrzavanje voća

### Promenjeno
- Oznaka „bez glutena" skinuta sa 27 šejkova koji koriste biljno mleko bez navedene vrste. Knjiga ne štampa tu oznaku po šejku, a autorka u napomeni upozorava na tragove glutena; ovseno mleko bi tu oznaku učinilo netačnom.

### Izostavljeno namerno
- Strana o autorki i posveta porodici, jer su lični podaci, ne sadržaj jelovnika

## [1.13.0] · 2026-10-03

### Dodato
- Omiljena jela: srce na kartici i u popupu, filter „Omiljena" prikazuje samo njih
- „Pravio sam": lonac na kartici i u popupu; filter ima tri stanja, isključen, samo ono što sam pravio, sakriveno ono što sam pravio
- Jelo koje je već pravljeno nosi tihu zelenu ivicu
- Dugme „Očisti moje oznake", uz potvrdu
- Obe liste se čuvaju samo u browseru korisnika, kao i ostava
- Smoothiemania, strane 44 do 53: 19 novih zapisa, kraj Kids poglavlja i početak Senior

## [1.12.0] · 2026-10-03

### Dodato
- Smoothiemania, strane 9 do 43: 66 novih zapisa, 64 šejka i 2 uvoda u poglavlja
- Poglavlja Detox, Diabetes i Kids šejkovi popunjena; Kids nosi i podnaslov potpoglavlja
- Petnaest novih sastojaka, između ostalog ananas, kivi, lubenica, dinja, bundeva, kamilica, đumbir, kokosovo i pirinčano mleko

## [1.11.0] · 2026-10-02

### Dodato
- Počeo unos knjige „Smoothiemania": šest novih poglavlja i prvih osam šejkova
- Oznaka „Vegan", sa svojom ikonicom i stavkom u legendi
- Šest novih sastojaka: borovnice, maline, breskva, zelena salata, maslačak, laneni protein
- Zapisi mogu da nose odštampan broj strane, pa se izvor prikazuje kao „strana 10" umesto broja skena
- `data/pitanja-za-autorku.md`, spisak strana za ponovni sken i nedoumica iz prve knjige

### Promenjeno
- Poglavlja i oznake bez ijednog jela se ne prikazuju, pošto se knjige unose postepeno

## [1.10.0] · 2026-10-02

### Dodato
- `data/books.json` sa tri knjige autorke; svaki zapis nosi polje `book`
- Oznaka knjige na kartici jela i u popupu, pored naziva poglavlja
- Naziv knjige ulazi u pretragu, pa se jela mogu naći i po njoj
- `build.py` proverava da li zapis pokazuje na postojeću knjigu i starim zapisima dodeljuje prvu knjigu

## [1.9.0] · 2026-09-26

### Promenjeno
- Glineni skin prerađen po predlošku: hladna plavo-siva podloga, bele napuhane površine i ćilibarski akcenat
- Senke dobile hladan ton i beli odsjaj gore levo; ćilibarske ispune nose sopstveni topli odsjaj
- Oblici zaobljeniji: pilule do kraja zaobljene, kartice 26 px, popup 34 px
- Ikonice u legendi i u ostavi dobile ćilibarski medaljon
- Polje za pretragu je udubljeno, kao utisnuto u podlogu

## [1.8.1] · 2026-09-26

### Promenjeno
- Glineni skin prešao na baby paletu: jedva vidljiva lila podloga, pastelni akcenat i mnogo tiše senke
- Sjaj oko popup-a uklonjen, ostala je samo meka senka ispod
- Boje poglavlja se u ovom skinu razblažuju u pastel, a nazivi poglavlja se mešaju sa mastilom da ostanu čitljivi; najsvetlije poglavlje čita se na 4.6:1
- Ispune više ne nose beli tekst, već tamno mastilo, pa akcenat može da ostane pastelan

## [1.8.0] · 2026-09-26

### Dodato
- Prekidač dizajna u gornjoj traci: „Knjiga" je postojeći izgled, „Glina" je novi claymorphism skin
- `assets/clay.css` sa glinenim skinom: meke napuhane površine, plava paleta, Poppins i Montserrat, zaobljene ivice od 22 do 30 px
- Izbor dizajna se pamti u browseru korisnika, kao i ostava; fontovi za glinu se učitavaju samo kada je taj skin uključen

## [1.7.1] · 2026-09-04

### Uklonjeno
- Natpisi „Prethodno" i „Sledeće" sa oznakom tastera na bočnim karticama; ostaje strelica u krugu na vrhu kartice

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
