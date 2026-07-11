---
title: Internet Identity Protocol (IID)
abbrev: IID Protocol
docname: draft-varnagy-iid-protocol-00
category: info

ipr: trust200902
area: General
workgroup: Independent Submission
keyword: 
   -identity
   -authentication
   -message
   -signature
author:
   -
      ins: Z.Varnagy
      fullname: Várnagy Zoltán
      organization: Independent
      email: doi6doi@gmail.com

# Abstract

A dokumentum az IID protokollt írja le, ami a személyi adatokhoz, 
és engedélyekhez köthető műveleteket definiál internetes identitások,
például természetes személyek, vagy programok között.
A protokoll egyszerű, bővíthető, platform-független, ember által is olvasható.
Tetszőleges átviteli csatornákon és kriptográfiai algoritmusokkal
is használható.

# MUST/SHOULD/MAY (RFC 2119/8174)

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", 
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in 
this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] 
when, and only when, they appear in all capitals, as shown here.

# IANA Considerations

This document has no IANA actions.

# Bevezetés

Jelenleg nincs olyan protokoll, ami az internetes identitáshoz kapcsolódó 
funkciókat általánosan, egységes módon tudná kezelni. A különböző feladatokra 
- például hitelesítés, személyes adatok átadása, hozzájárulások kezelése, 
digitális aláírás - különféle eltérő és egyedi megoldások léteznek, amik csak részben
kompatibilisek egymással.

# Célkitűzések

A protokoll célja, hogy egységes kereteket biztosítson az internetes 
identitásokhoz kapcsolódó műveletekhez, mint:

- Hitelesítés (beléptetés, sso)
- Személyes adatok közlése
- Hozzájárulások és jóváhagyások kezelése
- Adatok tanúsítása
- Digitális aláírás
- Személyes adatok vagy hozzájárulások visszavonása
- A protokoll bővítése további funkciókkal

A protokoll lehetőleg minél egyszerűbb, alapesetben ember által is olvasható legyen.

A protokoll architektúra-függetlenül, tetszőleges programnyelven egyszerűen megvalósítható legyen.

A protokoll a technikai részletekre (konkrét átviteli réteg, kriptográfiai algoritmusok) ne adjon
megkötést, hogy a jelenlegi és jövőbeli környezetekhez könnyen igazítható legyen.

# Alapötlet

A protokoll alapötlete a célkitűzésekhez szükséges üzenetek definiálása egy JSON-alapú formában. 
Az üzenetek konkrét átviteli módja (https, tcp, vagy más szállítási mód) nem része a protokollnak. 

Az üzenetek internetes identitások között mozognak, jellemzően de nem kötelezően 
tartalmazzák az üzenet időpontját, a küldőt, a címzettet, 
az üzenet digitális ellenőrzéséhez szükséges adatokat. 

# Fogalmak

Internetes identitás: Az interneten azonosítható és kommunikációra képes szereplő,
   például természetes személy, cég, kiszolgáló, robot, vagy AI-ügynök

Internetes azonosító (IID): Egy internetes identitás globálisan egyedi azonosítója 
   (pl. foo@bar.org)

IID Kiszolgáló: Az internetes identitásokhoz tartozó adatok és műveletek kezelését végző szerver.

IID Üzenet: Az internetes identitások között átadásra kerülő, JSON formában leírható üzenet.

# Protokoll

## Speciális JSON stringek

Az IID protokoll alapvetően JSON-nal dolgozik. 

A #-tel kezdődő stringek külön jelentéssel bírnak:

 - ##... : Korábbi (JSON) #-el kezdődő string, ami az első # elhagyásával marad
   (pl. ##foo -> #foo)
 - #6... : Base64-gyel kódolt bináris adat. (pl. #6WA==)
 - #x... : Hex-ként kódolt bináris adat. (pl. #x58)
 - #e... : Hiba token. (pl. #eiid.missing)
 - #m... : Művelet token. (pl. #miid.weblogin)
 - #t... : Típus token. (pl. #tiid.composite)
 - #a... : Algoritmus token. (pl. #aiid.md5)
 - #r... : Elvárás token (pl. #riis.at)
 - #d... : Adat token (pl. #diid.zip)

## JSON objektumok

Az üzenetek JSON formájúak, minden üzenet egy JSON objektum. 
Az egyes objektumok lehetséges felépítése és jelentése szerteágazó, 
nagy részük a következőekben kerül leírásra.

Bármilyen objektum bármilyen mezőket tartalmazhat, az itt leírtakon túl.
Ha egy kiszolgáló, vagy kliens az üzenet bizonyos részeit nem érti,
ő dönthet arról, hogy figyelmen kívül hagyja, vagy hibával tér vissza a hívóhoz.

Ha az üzenet nem tartalmaz valamely, a másik fél számára elengedhetetlen mezőt,
hibával tér vissza

## Típusjelölések

Az egyes üzenetrészeket a következő jelölésekkel definiáljuk:

Az alaptípusok:
   %null%: csak az üres értéket tartalmazó típus
   %bool%: logikai érték (true/false)
   %nat%: természetes egész szám, 0, vagy nagyobb
   %int%: egész szám
   %ascii%: ascii szöveg (0x20..0x7e)+
   %str%: szöveg (unicode)
   %stamp%: időbélyeg (unix timestamp egész)
   %iid%: IID azonosító (pl. foo@bar.org)
   %date%: Dátum (YYYYMMDD)
   %country%: Országkód (ISO 3166-1 alpha-2)
   %phone%: Telefonszám (+?[0-9]{3,})
   %lang%: Nyelv kód (BCP-47)
   %bin%: bináris adat (pl. base64 vagy hex) 
   %url%: webes link
   %obj%: valamilyen (mezőket tartalmazó) objektum
   %#...%: valamilyen token, vagy fix érték
   %any%: bármilyen érték

Új típusokat a korábbiakból származtathatunk a következő módokon:

Unió:
   %a% | %b% | %c%
   A fenti típusok valamelyike

Tömb:
   [%t%]
   %t% típusú elemeket tartalmazó tömb

Elem vagy tömb:
  {%t%}
  %t% típusú elem, vagy azokat tartalmazó tömb 

Leszármaztatás:
   %a% {
      !f1: %t1% - comment1
      f2: %t2% - comment2
      ...
   }
   Olyan a-ból származó objektum, aminek az f1 mezője %t1% típusú,
   comment1 jelentéssel, stb...

   Ha egy mező előtt ! szerepel, az az alapmező. Ilyen esetben
   ha az objektum helyén egy skalár érték szerepel, akkor azt
   úgy kell tekinteni, mintha csak egy alapmező értéket tartalmazó
   objektum volna.

## IID típusok

### Üzenet (%iid.message%)

Általános üzenet, ami két alany között átadásra kerülhet

%iid.message% : %obj% {
   type: %#t% - Típusleíró
   at: %stamp% - Az üzenet időpontja (unix timestamp)
   from: %iid.subject% - Az üzenet forrása
   to: %iid.subject% - Az üzenet címzettje
   error: %iid.error% - Hiba. Ha szerepel, a hívás sikertelen.
   mid: %ascii% - Üzenet azonosító
   sign: {%iid.sign%} - Digitális aláírás.
   encrypted: %iid.encrypted% - Titkosított üzenet
}

### Alany (%iid.subject%)

Internetes identitás azonosítása. Általában maga az IID azonosító,
de más mezők alapján is elképzelhető.

%iid.subject% : %iid% | %obj%

### Hiba (%iid.error%)

Hiba az üzenetváltásban. Vonatkozhat a korábbi üzenet szintaktikájára, az adatok
tartalmára, hiányzó jogosultságra, vagy bármi másra.

Egyszerűbb esetben egy hibatoken. Ha a hibához további részletek tartoznak
(pl. szöveges leírás), akkor az objektum-formát használjuk.

%iid.error% : %obj% {
   !error: %#e%
   message: %str% - Hibaüzenet természetes nyelven
}

### Aláírás (%iid.sign%)

Digitális aláírás. Ha nincs benne ref mező, akkor az aláírás a tartalmazó
objektumra vonatkozik, a sign mező eltávolítása után, az objektum JCS
formára hozásával. Az objektumot többen is aláírhatják, úgy az
egyes aláírás objektumok egy tömbbe kerülnek. Ha több aláíró van, minden
aláírásnak érvényesnek kell lennie.

%iid.sign% : %obj% {
   owner: %iid.subject% - Az aláíró
   key: %iid.key% - Az aláíró kulcsa
   ref: %iid.ref% - Utalás az aláírt adatra (pl. id, hash, url, stb...)
   sign: %bin% - Digitális aláírás binárisan
}

### Titkosított adat (%iid.encrypted%)

Ha a közvetítő csatorna nem elég megbízható, vagy valahol titkos adatot
kell küldeni, a következő mezőkkel tehető meg. A hiányzó mezők
a küldés környezetéből derülnek ki.

%iid.encrypted% : %obj% {
   !data: %bin% - Maga a kódolt adat. 
   owner: %iid.subject% - A visszafejtéshez szükséges kulcs birtokosa
   key: %iid.key% - A kódoló kulcs
}

### Kulcs (%iid.key%)

Egy titkosító, vagy aláíró kulcs. Általában csak a névvel hivatkozódik, a 
kulcs részletes adatai (publikus rész, algoritmus, lejárat, stb...)
az identitás-szervertől kérhetők le. Egy kulcsot a tulajdonosa (%iid%)
és a neve azonosít.

Bizonyos esetekben (pl. kiszivárgás) az identitás-szerver visszavonhat egy
kulcsot. Ilyenkor az until mezőt a továbbiakban már nem osztja meg,
helyette a revoked érték szerepel, ami a visszavonás időpontja. 
Kiszivárogtatás esetén ezt célszerű a szivárgás feltételezett időpntja
előtti értékre tenni. Minden ez utáni aláírást érvénytelennek kell tekinteni.

Az identitás-szerver nem írhat alá visszavont kulccsal.

%iid.key% : {
   !name: %str% - A kulcs neve
   algo: %iid.algo% - A kódoló algoritmus
   pub: %bin% - A kulcs publikus része
   from: %stamp% - Az érvényesség kezdete
   until: %stamp% - Az érvényesség vége
   revoked: %stmp% - A kulcs visszavonásának ideje
}
 
### Hivatkozás (%iid.ref%)

Valamilyen adat azonosítása. Szöveges azonosító esetén a környezetből derül ki,
hogy mire hivatkozik. Objektum esetén az objektum mezői azonosítják a
hivatkozott adatot.

%iid.ref% : %obj% {
      !id: %str% - Az adat azonosízója
      name: %str% - Az adat neve
      filename: %str% - Az adat fájlneve
      hash: {%iid.hash%} - Az adat valamilyen hash kódja (vagy kódjai)
   }

### Kriptográfiai algoritmus (%iid.algo%)

Egyszerűbb esetben egy ismert kriptográfiai algoritmust jelölő token (pl. #aiid.md5), 
összetettebb esetben pedig egy objektum, ami az algoritmus nevét és paramétereit
tartalmazza.

%iid.algo% : %obj% {
   !algo: %str%
}

### Kérés (%iid.request%)

Egy iid kérés egy másik internetes identitás számára küldött olyan üzenet,
amire választ vár:

%iid.request% : %iid.message% {
   action: %#m% - A hívott funkció
   params: %any% - A hívás további paraméterei
   requirement: {%iid.requirement%} - A válaszban igényelt részletek
}

### Válasz (%iid.response%)

Egy kérésre adott válasz.

%iid.response% : %iid.message% {
   ref: %iid.ref% - Hivatkozás a kérésre (pl. mid, vagy hash)
   value: %any% - A hívás eredménye
}

### Összetett üzenet (%iid.composite%)

Bizonyos esetekben egy üzenetben kezelhető több kérés, vagy bizonyos
kérésekre válasz, esetleg egyes válaszokhoz visszakérdezés. Erre
szolgálnak az összetett üzenetek.

%iid.composite% : %iid.message% {
   parts: [%iid.message%] - Az üzenet részei (request, response)
}

### Hash érték (%iid.hash%)

Valamilyen adatból számolt ellenőrző vagy azonosító érték.

%iid.hash% : %obj% {
   algo: %iid.algo% - A használt algoritmus
   value: %bin% | %nat% - A hash érték
}

### Elvárás (%iid.requirement%)

Amennyiben egy kérésre adott válasszal kapcsolatban elvárásai vannak
egy félnek, azt ezzel adhatja meg. Alapesetben csak egy elvárás 
azonosító, vagy további adatok egy objektumban.

%iid.requirement% : %obj% {
   !requirement: %#r%
}

### Identitiás fajta (%iid.idkind%)

Az identitás fajtája

%iid.idkind% : #diid.person | #diid.firm | #diid.crawler | #diid.aiagent

## Tokenek

A protokoll definiál néhány alaptokent az alapvető működéshez. (#a..., #e...)
Jelen dokumentum az iid. névterű tokeneket írja le. Más névterek használata
is megengedett, azok jelentését protokoll-kiterjesztések, 
vagy maguk az identitás-szerverek definiálják.

### Hiba tokenek

#eiid.json - Szintaktikailag hibás érkező json adat
#eiid.time - Nagyon különböző időbélyeg
#eiid.refuse - Kérés megtagadása
#eiid.callback - Csak azután válaszol, ha előbb egy kérésre válaszol a másik fél
#eiid.repeat - Ismételje meg a kérést, és teljesítse a requirement-eket
#eiid.sign - A digitális aláírás helytelen (visszavont, lejárt, hibás)
{ error:#eiid.size, limit:%nat% } - Túl nagy üzenet méret
{ error:#eiid.missing, field:%str% } - Hiányzó kötelező mező
{ error:#eiid.unknown, field:%str% } - Ismeretlen érték
{ error:#eiid.later, until:%stamp% } - Pillanatnyi visszautasítás, később lehet válasz
{ error:#eiid.redirect, url:%str% } - Böngésző átirányítása másik címre

### Művelet tokenek

#miid.login - Rendszerbe való bejelentkezés visszaigazolása
#miid.data - Egy internetes identitás adatainak lekérdezése
#miid.consent - Művelet (pl. sütihasználat) engedélyezése
#miid.message - Azonnali üzenet küldés
#miid.sign - Digitális aláírás kérése
#miid.testify - Egy adat vagy állapot tanúsítása
#miid.revoke - Egy hozzájárulás, vagy adat-tárolás visszavonása
#miid.key - Egy identitás kulcsainak lekérdezése

### Típus tokenek

#tiid.request - Kérés a másik fél felé
#tiid.response - Válasz
#tiid.composite - Kéréseket és válaszokat tartalmazó összetett üzenet

### Algoritmus tokenek

Hash algoritmusok, ellenőrző összegek

#aiid.size - Adat mérete bájtban
#aiid.crc32 - ISO/IEC 3309
#aiid.md5 - RFC 1321
#aiid.sha1 - FIPS 180-4
#aiid.sha256 - FIPS 180-4
#aiid.sha384 - FIPS 180-4
#aiid.sha512 - FIPS 180-4
#aiid.sha3-256 - FIPS 202
#aiid.sha3-512 - FIPS 202
#aiid.blake3 - BLAKE3

Titkosítás

#aiid.aes - FIPS 197
#aiid.chacha20 - RFC 8439

Digitális aláírás

#aiid.ed25519 - RFC 8032
#aiid.ecdsa - FIPS 186-5
#aiid.rsa-pkcs1v15 - RFC 8017
#aiid.rsa-oaep - RFC 8017
#aiid.rsa-pss - RFC 8017

### Adat tokenek

#diid.name - Az identitás neve
#diid.givenname - Keresztnév
#diid.familyname - Vezetéknév
#diid.nickname - Becenév
#diid.birthdate - Születési dátum: %date%
#diid.birthplace - Születési hely
#diid.age - Életkor: %nat%
#diid.adult - Felnőtt: %bool%
#diid.language - Nyelv: {%lang%}
#diid.kind - Az identitás fajtája: %iid.idkind%
#diid.address - Lakcím {%str% | %obj%}
#diid.postaddress - Postázási cím {%str% | %obj%}
#diid.country - Ország: %country%
#diid.state - Állam
#diid.city - Város
#diid.district - Kerület
#diid.zip - Irányítószám
#diid.street - Utca
#diid.house - Házszám
#diid.floor - Emelet
#diid.door - Ajtó
#diid.email - E-mail cím
#diid.phone - Telefonszám: {%phone%}
#diid.website - Webcím
#diid.taxid - Adószám
#diid.personalid - Személyi azonosító
#diid.companyid - Cégazonosító szám
#diid.passport - Útlevél szám
#diid.company - Munkahely %iid%
#diid.department - Részleg
#diid.position - Munkakör
#diid.avatar - Avatár: %url% | %bin%
#diid.until - Adat megosztás legkésőbbi ideje
#diid.attester - Olyan identitás, aki tanúsítja az adatok helyeséségét: {%iid%}

### Adat token értékek

#diid.person - Természetes személy
#diid.firm - Cég, jogi személy
#diid.crawler - Webes robot
#diid.aiagent - MI ágens
#diid.newsletter - Hírlevél küldés
#diid.cookie.marketing - Marketing süti
#diid.cookie.analytics - Analytics süti

### Elvárás tokenek

#riid.at - A válaszban kell lennie időbélyegnek
#riid.from - A válaszban kell lennie forrás mezőnek
#riid.to - A válaszban kell legyen címzett mező
#riid.mid - A válasznak kell legyen azonosítója
#riid.sign - A válasz alá kell legyen írva
#riid.encrypted - A válasz titkosított kell legyen
#riid.echo - A válasz ref részében meg kell ismételni a kérést
{ requirement: #riid.key, key: %iid.key% } - A válaszban ezt a kulcsot kell használni
{ requirement: #riid.url, url: %str% } - A kérést másik url-en ismételje meg

## Példák

Következik néhány példa-kommunikáció bizonyos helyzetekben.

### Webes bejelentkezés

A john@doe.org nevű személy meglátogatja a foo.org weboldalt.
Ha sütiben nincs tárolva, és a böngésző nem adja át pl. HTTP headerként,
akkor bekéri a látogató iid-jét. Az iid alapján megkeresi a szervert (doe.org),
amit megszólít a dedikált végponton:

foo.org >>> doe.org { 
   "mid": "23456781",
   "at": 1783473439,
   "from": "site@foo.org",
   "to": "john@doe.org",
   "action": "#miid.login",
   "params": {
      "ip":"1.2.3.4",
      "returnurl":"https://foo.org/onlogin"
   }
   "requirement": ["#riid.sign","#riid.echo"]
}

A doe.org rögzíti, hogy a foo.org belépést kér. Azt válaszolja, hogy ő
akarja azonosítani a böngészőt.

foo.org <<< doe.org {
   "error":"#eiid.redirect",
   "value": {
      "url":"https://doe.org/login",
      "nonce": 12345678
   }
   "sign": {
      "key":"log2026",
      "sign":"#6..."
   }
}

A foo.org látja, hogy átirányítást kér az identitás-szerver.
Átirányítja a böngészőt a https://doe.org/login címre.

Ha John nincs belépve, ott be tud lépni. Ezután az 
identitás-szerver beállításatól függ, hogy kér-e megerősítést a foo.org
belépéséhez. Ha nem, akkor azonnal folytatódik a folyamat. 
Az identitás-szerver visszairánytíja őt a https://foo.org/onlogin-ra. 
Ez indítja a második kérést:

foo.org >>> doe.org { 
   "mid": "23456782",
   "at": 1783473449,
   "from": "site@foo.org",
   "to": "john@doe.org",
   "action": "#miid.login",
   "params": {
      "ip":"1.2.3.4",
      "nonce": 12345678
   }
   "requirement": ["#riid.sign","#riid.echo"]
}

A doe.org-nál már rögzítve van, hogy ezzel a nonce-szal a belépés engedélyezett.
Visszaadja az aláírt engedélyt a belépéshez.

foo.org <<< doe.org {
   "at": 1783473449,
   "value": true,
   "ref": {"mid":"23456782","at":...}
   "sign":{
       "key":"log2026",
       "sign":"#6..."
   }
}

A szerver az első belépésnél ilyenkor lekérheti John publikus kulcsát, és eltárolhatja.
A publikus kulcs birtokában ellenőrizheti az aláírás helyességét, akár tárolhatja is 
a választ, ha később igazolni akarja, hogy tényleg engedélyt kapott a beléptetésre.
Ezután, vagy ha eleve megbízik az identitás-szerveri kapcsolatban, akkor belépteti
John-t az oldalra.

Fontos megjegyzés, hogy a második belépésnél, ha pl. a foo.org az identitást sütiben tárolja,
Az egész folyamat végig tud menni felhasználói interakció nélkül.

### Személyes adatok kérése

John (john@doe.org) meglátogat egy webshop-ot. A webshop a böngészőtől átveszi,
süti alapján visszakapja, vagy bekéri John iid-jét. Szeretné megtudni, hová küldje a kiválasztott
árukat, ezért megszólítja a doe.org-ot:

webshop.com >>> doe.org {
   "mid": "23456783",
   "at": 1783473539,
   "from": "site@webshop.com",
   "to": "john@doe.org",
   "action": "#miid.data",
   "params": ["#diid.name","#diid.postaddress"],
   "requirement": ["#riid.sign","#riid.echo"]
   "sign": {
      "key":"req2026",
      "sign":"#6..."
   }
}

A doe.org ellenőrizheti a webshop.com aláírását.
Beállításaitól függően megtagadhatja ezt, vagy átirányítathat egy megerősítő oldalra.
Tegyük fel, hogy jelen esetben (pl. korábbi megerősítés miatt) átadja az adatokat:

webshop.com <<< doe.org {
   "at": 1783473540,
   "value": {
      "#diid.name":"John Doe",
      "#diid.postaddress": {
         "#diid.country":"US",
         "#diid.state":"New York",
         "#diid.zip":"10004",
         "#diid.street":"Liberty",
         "#diid.house":1
      },
      "#diid.until":1783559940
   }
   "ref": {"mid":"23456783","at":...}
   "sign":{
       "key":"data2026",
       "sign":"#6..."
   }
}

A webshop.com megkapja a kézbesítési címet, amit John rendelkezése szerint egy napig tárolhat. 
Ez bőven elég arra, hogy elküldje a csomagot.

### Hozzájárulás

A webshop John hozzájárulását kéri, hogy hírleveleket küldjön neki, és marketing sütiket tároljon
a böngészőben.

webshop.com >>> doe.org {
   "mid": "23456784",
   "at": 1783473639,
   "from": "site@webshop.com",
   "to": "john@doe.org",
   "action": "#miid.consent",
   "params": ["#diid.newsletter","#diid.cookie.marketing"],
   "requirement": ["#riid.sign","#riid.echo"]
}

Az identitás-szerver korábbi beállítások, vagy átirányítás és megerősítés után válaszol,
hogy hírlevelet nem engedélyez, de marketing sütiket igen.

webshop.com <<< doe.org {
   "at": 1783473640,
   "value": {
      "#diid.newsletter":false,
      "#diid.cookie.marketing":true
   }
   "ref": {"mid":"23456784","at":...}
   "sign":{
       "key":"data2026",
       "sign":"#6..."
   }
}

### Hozzájárulás visszavonása

John leiratkozik a hírkevélről, és utasítja a webshopot, hogy felejtse el
a telefonszámát

doe.org >>> webshop.com {
   "at": 1783473739,
   "from": "john@doe.org",
   "to": "site@webshop.com",
   "action": "#miid.revoke",
   "params": ["#diid.newsletter","#diid.phone"],
   "sign":{
      "key":"data2026",
      "sign":"#6..."
   }
}

A webshop ellenőrzi John aláírását, leiratja a hírlevélről, és elfelejti a számot

doe.org <<< webshop.com {
   "at": 1783473740,
   "value": true,
   "sign":{
       "key":"req2026",
       "sign":"#6..."
   }
}

### Tanúsítás, kulcslekérdezés

A foo.org website bizonyítható megerősítést szeretne, hogy helyesen tárolja az ügyfele publikus kulcsát.
Megszólít egy tanúsító-szervert (bar.org)

foo.org >>> bar.org {
   "mid": "23456785",
   "at": 1783473839,
   "from": "site@foo.org",
   "to": "clerk@bar.org",
   "action": "#miid.testify",
   "params": {
      "iid": "john@doe.org",
      "key": "data2026",
      "pubkey": "#xabcd..."
   }
   "requirement": ["#riid.sign","#riid.echo"]
   "sign": {
      "key":"req2026",
      "sign":"#6..."
   }
}

A bar.org lekéri a kulcsot a doe.org-tól:

bar.org >>> doe.org {
   "at": 1783473840,
   "from": "clerk@bar.org",
   "to": "john@doe.org",
   "action": "#miid.key",
   "params": "data2026"
   "requirement": [
      {
         "requirement":"#riid.key",
         "key":"data2026"
      },
      "#riid.at",
      "#riid.from"
   ]
}

<<< a doe.org kiadja a kulcs részleteit, és alá is írja vele a választ.

bar.org <<< doe.org {
   "at": 1783473841,
   "from":"john@doe.org",
   "value": {
      "name":"data2026",
      "algo":"#aiid.ed25519",
      "pubkey":"xabcd...",
      "from": 1767225600,
      "until": 1798761600
   }
   "sign":{
      "key":"data2026",
      "sign":"#6..."
   }
}

A bar.org a publikus kulcs alapján visszaellenőrzi, hogy az aláírás helyes-e. 
Ha igen, abban is biztos lehet, hogy John rendelkezik a titkos kulccsal. Ha egyezik
a pubkey a foo.org kérésével, akkor válaszol neki.

foo.org <<< bar.org {
   "at": 1783473842,
   "value": true,
   "ref": {"mid":"23456785","at":...}
   "sign":{
       "key":"tes2026",
       "sign":"#6..."
   }
}

### Azonnali üzenet, feltételes válasz

John üzenetet küld egy cégnek

doe.org >>> firm.org {
   "at": 1783473940,
   "mid": "23456786",
   "from": "john@doe.org",
   "to": "info@firm.org",
   "action": "#miid.message",
   "params": {
      "data": "Kérem, tájékoztassanak a jelentkezési feltételeikről.",
      "mime": "text/plain"
   }
}

A cég csak akkor veszi át az üzenetet, ha John megadja a telefonszámát.

doe.org <<< firm.org {
   "at": 1783473941,
   "type":"#tiid.composite",
   "parts": [{ 
      "type":"#tiid.response",
      "ref":"23456786",
      "error": "#eiid.callback"
   },{
      "mid":"23456787",
      "type":"#tiid.request",
      "action": "#miid.data",
      "params": "#diid.phone",
      "requirement": "#riid.sign",
   }]
}

John szervere (belső megerősítés után) átadja a számot

doe.org >>> firm.org {
   "at": 1783473942,
   "ref": "23456787",
   "value": "+100112345678",
   "sign":{
      "key":"data2026",
      "sign":"#6..."
   }
}

A cég átveszi az üzenetet

firm.org >>> doe.org {
   "at": 1783473943,
   "ref": "23456786",
   "value": true
}

# Implementáció

Jelen protokoll nem köt ki implementációs részleteket, 
de ajánlásokat ad az identitás-szerverek elhelyezésére.

## DNS elérés

Az identitáshoz tartozó szerver az identitás @ utáni részéből határozható meg
DNS feloldással. Például a john@doe.org identitáshoz tartozó szerver a doe.org domainhez
tartozó IP-címen érhető el.

## .well-known

Javasolt a domainhez tartozó https webkiszolgálón egy /.well-known/iid végpont létrehozása.
A végpont közvetlenül is kiszolgálhatja az iid-kéréseket, vagy más végpontra átirányíthatja át őket
a következő válasszal:

{
   "error":"#eiid.repeat",
   "requirement":{ 
      "requirement":"#riid.url", 
      "url":"https://foo.org/iid" 
   }
}

# Biztonsági megfontolások

A protokoll általánosságban egy biztonságos, ellenőrzött, titkosított csatornán keresztüli adatátviteli
módot feltételez (pl. https kapcsolat). A példáknál három környezetet különböztetünk meg:

 - Védett: A kommunikáció biztonságos csatornán keresztül zajlik, a végpontok azonosíthatók
 - Ismert: A felek előzetesen ismerik a másik fél nyilvános kulcsát
 - Kockázatos: A kapcsolat nem biztonságos, és nem ismertek a nyilvános kulcsok.

Az alábbi példákból levonható általános tapasztalat:

A Védett önmagában garantálja a titkos és változatlan adatátvitelt.
Ismert környezetben a fentiek megfelelő intézkedésekkel biztosíthatók
A Kockázatos esetben a közölt adatok harmadik fél által megismerhetők, vagy megváltoztathatók.

## Hamis küldő

Védett, Ismert: Azoknál a műveleteknél, ahol ez lényeges, a fogadó oldal megkövetelheti a kérés aláírását.
   Az aláírt részben szerepel a küldő.

Kockázatos: A küldő identitása nem garantálható.

## Hamis címzett

Védett: A csatorna garantálja, hogy a címzett nem változik meg.

Ismert: A fogadó oldal megkövetelheti a kérés aláírását. Az aláírt részben szerepel a címzett.

Kockázatos: Nem biztosítható, hogy a címzett egyezik a küldő kérésével.

## Kérés újrajátszás

A fogadó oldal megkövetelheti a kérésben az időbélyeget.
Ha egy másodperc alatt nem válaszol több kérésre egy küldő és címzett vonatkozásában,
akkor az újrajátszás kizárható. Ilyen esetekben #eiid.later hibát adhat vissza.
 Sok esetben fontosabb a küldő azonosítása, ha az biztos, akkor az újrajátszás általában 
megengedhető.

Védett: Az üzenet nem olvasható ki a csatornából, így más nem tudja reprodukálni.

Ismert: A küldő azonosítása után az újrajátszás általában megengedhető.

Kockázatos: Ha megköveteljük az időbélyeget a kérésben, és egy küldő-fogadó viszonylatában
   másodpercenként csak egy kérésre válaszolunk, a visszajátszás kizárható, viszont
   megváltozatott időbélyeg esetén a megismételt kérésre más fél is megkaphatja a választ.

## Válasz újrajátszás

A küldő fél a választ csak kérés után értelmezi, vagyis a visszajátszott választ nem dolgozza fel.

## Válasz beszúrás

Védett: A csatornába harmadik fél nem tud saját választ beszúrni

Ismert: A küldő megkövetelheti a válasz aláírását. Ez garantálja, hogy más válaszát ne fogadja el.

Kockázatos: Nem zárható ki, hogy harmadik fél hamis választ adjon a küldőnek.

## Kulcs kompromittálódás

Ha egy titkos kulcs kiszivárog az identitás-szerverről, akkor annak birtokában egy harmadik fél 
kéréseket indíthat a tulajdonos nevében.

Bármelyik gépen, ami tárolja az identitások nyilvános kulcsait, célszerű egy határidőt
szabni minden kulcsra, ami után szükséges a kulcs újbóli lekérdezése.

Védett: kiszivárgott kulcs esetén sem adhat hamis válaszokat egy harmadik fél, mert a kérések
   az identitás-szerverre érkeznek.

Ismert, Kockázatos: A kiszivárgott kulcs birtokában mind küldő, mind fogadó oldalon hamis üzeneteket
   készíthet a harmadik fél.

## Közbeékelődéses támadás

Ha egy harmadik fél irányítást szerez a csatorna felett, például a DNS feloldás megváltoztatásával, 
az komoly visszaélésekre adhat okot.

Az átviteli protokoll javíthat a helyzeten, például HTTPS, vagy TLS kapcsolat kizárja az ilyen 
jellegű támadásokat, mivel megfelelő tanúsítvány-ellenőrzés esetén a közbeékelődő nem lehet birtokában 
a domain-hez tartozó tanúsítványnak.

Védett: Ez az eset nem tekinthető Védett-nek, mert ilyenkor a végpontok nem azonosíthatók.

Ismert: Ha az összes adatcsere csak az ismert kulcsokkal zajlik, az adatok nem változtathatók meg,
   de harmadik fél megismerheti a közölt információt. Ez is elkerülhető, ha minden üzenet titkosítva
   van (encrypted)

Kockázatos: A közbeékelődő fél tetszőlegesen eljárhat az identitás nevében.

## Titkosítás

Védett: A csatorna maga garantálja az adatátvitel titkosságát

Ismert: Ha a közölt adatok érzékenyek, érdemes minden üzenetet encrypted formában továbbítani

Kockázatos: Mivel a nyilvános kulcsok nem vihetők át megbízhatóan, nincs mód a biztonságos
   titkosítás elérésére.

## Túlterheléses támadás

Az identitás-szerver különösen nagy számú identitások esetén többféle túlterheléses támadás
áldozatává válhat. Az üzenetek felépítése, és a használati esetek miatt viszont 
ezek nagyrészt jól kezelhetők. A feladó azonossága hamar kiderül az üzenetből, a feladó nélküli
üzenetek akár el is utasíthatók. Egy feladó kéréseit a szerver sorbaállíthatja, akár
pár másodpercet várakozhat is az egyes válaszok között.

Valamelyest drágább művelet lehet a titkosított (encrypted) üzenetek feldolgozása. 
Ezeknél viszont a címzett ismert, az alapján ezek is sorba állíthatók, és megválaszolhatók
késleltetés után.

Ha a szerver végképp erőforrás híján van, egy kérésre #eiid.later választ is adhat, akár a kérés
feldolgozása nélkül is.


