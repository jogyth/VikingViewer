<div align="center">

# 🎳 VikingViewer

**Fra bowlingbanen til skjermen.**

En lettvektsvisning av Viking Scoring for sending, storskjerm og OBS.  
16 baner · 6 layouter · 2 oppsett · ingen eksterne pakker

![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Windows](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zero dependencies](https://img.shields.io/badge/Dependencies-0-22C55E?style=flat-square)

[Kom i gang](#kom-i-gang) · [Layouter](#layouter) · [Skjermvalg](#velg-visningsskjerm) · [Konfigurasjon](#konfigurasjon) · [Companion](#bitfocus-companion) · [Feilsøking](#feilsøking) · [Bidra](#bidra) · [Støtt prosjektet](#støtt-prosjektet) · [Lisens](#lisens)

</div>

---

## Én visning, flere måter å sende på

VikingViewer henter JPEG-bilder fra Viking Scoring-maskinene og viser valgte baner i nettleseren. Klargjør to oppsett, start visningen og bytt underveis med tastaturet eller Bitfocus Companion.

- **Seks layouter:** én stor bane, to til seks nederst eller et rutenett.
- **To lagrede oppsett:** velg baner og rekkefølge for hvert oppsett.
- **Eget visningsvindu:** velg skjerm og behold kontrollpanelet på laptopen.
- **Tre bakgrunner:** sort for vanlig visning, transparent for OBS eller chroma-grønn for keying.
- **Full HD:** et lerret på 1920 × 1080 som skaleres med vinduet.
- **Automatisk oppdatering:** nye bilder hvert femte sekund; siste gode bilde beholdes ved feil.
- **Felles styring:** åpne visninger følger samme aktive oppsett via Server-Sent Events.
- **Lokal drift:** Node-server på samme PC, med nettverksoppsett i en lokal `.env`.

## Kom i gang

### 1. Hent prosjektet

Du trenger **Windows**, **Node.js 22 eller nyere**, en moderne nettleser og tilgang til hallens Viking-nettverk.

```powershell
git clone https://github.com/jogyth/VikingViewer.git
cd VikingViewer
Copy-Item .env.example .env
```

Du kan også laste ned prosjektet som ZIP fra GitHub og pakke det ut.

### 2. Legg inn lokal pålogging

Åpne `.env` i en teksteditor og fyll inn:

```dotenv
VIKING_USERNAME=ditt_brukernavn
VIKING_PASSWORD="ditt_passord"
```

Resten av standardoppsettet kan beholdes hvis hallen bruker `slave1`–`slave8` og diskene `O:`–`V:`.

> [!IMPORTANT]
> `.env` inneholder lokal pålogging og ignoreres av Git. Del `.env.example` med andre. Passord med `#` eller mellomrom bør stå i doble anførselstegn.

### 3. Start og velg visning

Dobbeltklikk **`start.bat`**. Oppstarten kontrollerer nettverksdiskene, starter serveren og åpner:

**[localhost:3000/settings](http://localhost:3000/settings)**

Velg layout og baner for begge oppsettene og velg bakgrunn. Under **Visningsskjerm**, trykk **Finn skjermer**, tillat skjermtilgang og velg ønsket skjerm før du trykker **Launch**.

Visningen åpnes i et eget vindu. Kontrollpanelet blir værende på laptopen, med knapper for å bytte oppsett og lukke visningen.

Ingen `npm install` eller bygging er nødvendig.

<details>
<summary><strong>Starte serveren manuelt</strong></summary>

Hvis nettverksdiskene allerede er koblet til, kjør:

```powershell
npm start
```

Alternativt: `node server.js`.

Åpne deretter `http://localhost:3000/settings`. Direkte visningsadresse er `http://localhost:3000/view`.

`npm start` kjører serveren i forgrunnen. Stopp med **Ctrl+C**. `start.bat` starter Node i bakgrunnen; ved behov må Node-prosessen avsluttes for å stoppe den.

</details>

## Layouter

| Layout | Plassering | Baner |
| :--- | :--- | :---: |
| **1 stor** | Én rute over hele lerretet | 1 |
| **2 nederst** | To ruter med 33 % redusert bredde og høyde, samlet sentrert og bunnjustert | 2 |
| **4 nederst** | Fire like brede ruter, bunnjustert | 4 |
| **6 nederst** | Seks like brede ruter, bunnjustert | 6 |
| **4 fullskjerm** | Rutenett på 2 × 2 | 4 |
| **6 fullskjerm** | Rutenett på 3 × 2 | 6 |

Baner plasseres fra venstre mot høyre, deretter neste rad. Samme bane kan brukes i begge oppsett, men bare én gang innenfor hvert oppsett.

Hele JPEG-bildet vises med opprinnelig bildeforhold, uten strekk eller beskjæring. Hvor mye av ruten bildet fyller, avhenger derfor av bildeforholdet. Bruk en skjermutgang på **1920 × 1080** for visning i 1:1.

### Hurtigtaster

Disse gjelder i visningen:

| Tast | Handling |
| :---: | :--- |
| **1** / **2** | Velg oppsett |
| **F** | Be om fullskjerm |
| **S** | Tilbake til kontrollpanelet (lukker Launch-vinduet) |
| **Esc** | Avslutt fullskjerm |

### Velg visningsskjerm

- **Finn skjermer** ber nettleseren om tilgang til skjermlisten. Når tillatelsen allerede er gitt, lastes listen automatisk.
- **Automatisk** foretrekker en ekstern skjerm uten kontrollpanelet. Med én skjerm brukes den tilgjengelige skjermen.
- Skjermlisten viser navn og oppløsning. Velg en bestemt skjerm for å overstyre automatisk valg.
- **Launch** lagrer innstillingene og åpner visningen på den valgte skjermen. Et allerede åpent visningsvindu må lukkes før du velger en annen skjerm.
- **Vis oppsett 1 / 2**, **Vis vindu** og **Lukk visning** er tilgjengelige i kontrollpanelet mens visningsvinduet er åpent.
- Når en skjerm kobles fra, oppdateres listen. Appen flytter ikke en aktiv visning automatisk; neste Launch bruker det oppdaterte skjermvalget.

Sett Windows til **Utvid disse skjermene** når HDMI-utgangen går til ATEM og kontrollpanelet skal være igjen på laptopen. I duplisert modus er ikke skjermene uavhengige arbeidsflater.

> [!NOTE]
> Skjermvalg bruker nettleserens [Window Management API](https://developer.chrome.com/docs/capabilities/web-apis/window-management) og krever støtte og tillatelse i nettleseren. Bruk en oppdatert Chrome eller Edge og åpne appen via localhost. Hvis funksjonen mangler eller tillatelsen avslås, åpnes et vanlig visningsvindu som kan flyttes manuelt. Tillat popup-vinduer for appen hvis Launch blir blokkert.

Visningsvinduet forsøker å starte i fullskjerm. Nettleseren kan kreve et ekstra klikk: velg **Start fullskjerm** i visningsvinduet, eller bruk **F** / **F11**. **Esc** avslutter fullskjerm. **S** eller **Til kontrollpanelet** lukker et visningsvindu åpnet fra Launch og gir fokus tilbake til kontrollpanelet. På en direkte åpnet /view-side går **S** tilbake til innstillingene i samme fane.

## Konfigurasjon

Begge delene av prosjektet leser samme konfigurasjon via `config.js`: PowerShell bruker den til disktilkobling, og Node-serveren bruker den til å finne bildene. Verdier brukes i denne rekkefølgen: miljøvariabler fra systemet, deretter `.env`, deretter standardverdiene i `config.js`. Nettverkspålogging har ingen standardverdi.

| Variabel | Standard | Beskrivelse |
| :--- | :--- | :--- |
| `VIKING_USERNAME` | Tom | Brukernavn for nettverkspålogging |
| `VIKING_PASSWORD` | Tom | Passord for nettverkspålogging |
| `VIKING_HOST_PREFIX` | `slave` | Prefiks for maskin 1–8 |
| `VIKING_SHARE` | `c$` | Nettverksdeling på hver maskin |
| `VIKING_DRIVES` | `O,P,Q,R,S,T,U,V` | Åtte ulike diskbokstaver i banerekkefølge |
| `VIKING_IMAGE_DIR` | `Viking2001\GameCtrl` | Relativ bildemappe under delingen |

Standardoppsettet kobler til `\\slave1\c$` til `\\slave8\c$`, med to baner per maskin:

| Baner | Maskin | Disk |
| :---: | :--- | :---: |
| 1–2 | `slave1` | `O:` |
| 3–4 | `slave2` | `P:` |
| 5–6 | `slave3` | `Q:` |
| 7–8 | `slave4` | `R:` |
| 9–10 | `slave5` | `S:` |
| 11–12 | `slave6` | `T:` |
| 13–14 | `slave7` | `U:` |
| 15–16 | `slave8` | `V:` |

Eksempel på bildefil: `O:\Viking2001\GameCtrl\VTVFile1.jpg`. Filnavnene følger alltid `VTVFile<BANE>.jpg` for baner 1–16.

Oppsett og bakgrunn lagres når du trykker **Lagre innstillinger** eller **Launch**. De ligger i lokal `settings.json`, som også ignoreres av Git. Skjermvalget gjelder det åpne kontrollpanelet og lagres ikke i denne filen. Porten er fast satt til **3000**.

## OBS, HDMI og ATEM

### OBS

Start serveren og lagre ønsket oppsett og bakgrunn i kontrollpanelet. Legg deretter til en **nettleserkilde** med:

| Innstilling | Verdi |
| :--- | :--- |
| URL | `http://localhost:3000/view` |
| Bredde | `1920` |
| Høyde | `1080` |
| Bakgrunn i VikingViewer | **Transparent · OBS** ved behov |

OBS bruker `/view` direkte; **Launch** er for visning i et eget nettleservindu og er ikke nødvendig for OBS-kilden.

### HDMI / ATEM

Velg bakgrunn etter signalveien, og vis nettleseren i fullskjerm på skjermutgangen:

| Bakgrunn | Bruk |
| :--- | :--- |
| **Sort · HDMI / ATEM** | Vanlig visning eller luma key når grafikken egner seg for det |
| **Transparent · OBS** | Nettleserkilde med alpha, for eksempel i OBS |
| **Chroma-grønn · HDMI / ATEM** | Grønn bakgrunn (#00FF00) rundt bildene for chroma key i ATEM |

For chroma key velger du **Chroma-grønn** i VikingViewer og bruker grønnfargen som keyfarge i ATEM. Hele visningsbakgrunnen, inkludert tomrom rundt det skalerte lerretet, blir grønn. Sort er fortsatt standard.

> [!NOTE]
> Bakgrunnsvalget gjelder nettsidens bakgrunn. Chroma-grønn endrer ikke svart inne i JPEG-bildene. Transparent bakgrunn gjelder bare i en signalvei som støtter alpha. JPEG-bildene er fortsatt ugjennomsiktige, inkludert eventuell sort bakgrunn i bildet. Vanlig HDMI gir ikke alpha fra CSS; bruk keying eller en støttet key/fill-signalvei ved behov.

## Bitfocus Companion

På **samme PC** som VikingViewer: legg til forbindelsen **Generic: HTTP Requests** og send en forespørsel med metoden **POST**, uten nødvendig body.

| Handling | URL |
| :--- | :--- |
| Velg oppsett 1 | `http://127.0.0.1:3000/api/layout/1` |
| Velg oppsett 2 | `http://127.0.0.1:3000/api/layout/2` |
| Bytt oppsett | `http://127.0.0.1:3000/api/layout/toggle` |

Status kan leses med **GET** `http://127.0.0.1:3000/api/state`. Endringer sendes automatisk til åpne visninger.

Serveren lytter bare på `127.0.0.1`. Companion og nettleserkilder på andre maskiner får derfor ikke tilgang.

## Feilsøking

<details>
<summary><strong>En eller flere baner er utilgjengelige</strong></summary>

Kontroller at PC-en er på riktig nettverk, at påloggingen i `.env` stemmer, og at bildefilene finnes på nettverksdiskene.

Før første vellykkede bilde vises bare en feilmelding for den utilgjengelige banen; tomme bildeelementer skjules. Hvis et bilde allerede er lastet, beholdes det ved senere feil. Feilmeldingen er en status for samme bildefelt, ikke et ekstra scoreboard.

Oppstarten gjenbruker riktige SMB-tilkoblinger og prøver manglende tilkoblinger inntil tre ganger med to sekunders mellomrom. Visningen starter selv om enkelte baner mangler, og forsøker å hente bildene igjen hvert femte sekund.

Kjør bare nettverkskontrollen med:

```powershell
powershell.exe -NoProfile -File .\connect-drives.ps1
```

Start Node i samme vanlige Windows-brukerøkt som de mappede diskene.

</details>

<details>
<summary><strong>En diskbokstav peker allerede et annet sted</strong></summary>

Skriptet viser en advarsel og lar tilkoblingen være urørt. Kontroller tilkoblingene med `net use`, og avklar riktig oppsett manuelt.

En tilkobling med IP-adresse regnes som en annen sti enn maskinnavnet, selv om de kan peke til samme maskin. Eksisterende disker slettes eller omkobles aldri automatisk.

</details>

<details>
<summary><strong>Maskinnavn blir ikke funnet</strong></summary>

Ved vedvarende feil viser oppstarten resultatet av navneoppslag. Sammenlign IP-adresse og nettverksoppsett med en fungerende PC.

For eksempel kan SMB-tilgang til den første maskinen undersøkes med:

```powershell
Test-NetConnection slave1 -Port 445
```

Bytt ut `slave1` hvis du har endret maskinprefikset. Skriptet endrer ikke DNS-oppsett eller gjetter IP-adresser.

</details>

## Bidra

Feilrapporter, forslag og kodebidrag er velkomne! Har du brukt VikingViewer i en bowlinghall eller sending, hører vi gjerne hva som fungerer og hva som kan bli bedre.

- **Funnet en feil?** [Opprett en issue](https://github.com/jogyth/VikingViewer/issues/new) med hva du gjorde, hva du forventet og hva som skjedde. Ta gjerne med Windows- og nettleserversjon, relevante feilmeldinger og et skjermbilde.
- **Savner du en funksjon?** [Del forslaget i en issue](https://github.com/jogyth/VikingViewer/issues/new), og beskriv hvordan du vil bruke den.
- **Vil du bidra med kode eller dokumentasjon?** Pull requests er velkomne. Ved større endringer er det fint å diskutere løsningen i en issue først. Beskriv endringen og hvordan den er kontrollert; kjør `npm test` ved kodeendringer.

[Sjekk eksisterende issues](https://github.com/jogyth/VikingViewer/issues) før du oppretter en ny. Ikke legg ved `.env`, passord eller annen sensitiv informasjon. Sladd personopplysninger i skjermbilder og logger.

## Støtt prosjektet

Har du nytte av VikingViewer? En frivillig donasjon bidrar til videre utvikling og vedlikehold. Alle bidrag settes pris på!

**Vipps til 93830550** — merk gjerne betalingen «VikingViewer».

VikingViewer er gratis og åpen kildekode. Donasjoner er helt frivillige og gir ingen garanti for bestemte funksjoner eller svartid. Du kan også støtte prosjektet ved å rapportere feil, bidra med kode eller dokumentasjon, eller gi det en ⭐ på GitHub.

## Lisens

VikingViewer er åpen kildekode under [MIT-lisensen](LICENSE). Du kan bruke, endre og dele programmet, også kommersielt, så lenge opphavsrettsmerknaden og lisensvilkårene følger med. Programmet leveres uten garanti; se lisensen for fullstendige vilkår.

## Utvikling

Vanilla JavaScript i nettleseren, innebygd HTTP-server i Node og PowerShell for Windows-disktilkobling. Ingen rammeverk, eksterne npm-pakker eller byggesteg.

```powershell
npm start
npm test
```

De automatiserte testene dekker skjermvalg og vindusstyring med simulerte nettleserobjekter, inkludert popup-blokkering, avvist skjermtilgang og frakobling av skjermer. Servertestene dekker konfigurasjon, validering av alle seks layouter og tre bakgrunnsvalg, lagring, HTTP-styring, hendelsesstrøm, logo/script-endepunkter og avvisning av fremmed web-origin. De kontrollerer også at konfigurasjonsfiler ikke serveres over HTTP. Testene bruker midlertidige mapper og endrer ikke dine lagrede oppsett.

I et begrenset kjøremiljø som blokkerer opprettelse av testprosesser, kan testene kjøres uten prosessisolasjon på en Node-versjon som støtter dette:

```powershell
npm test -- --test-isolation=none
```

Før bruk i sending bør skjermplassering, fullskjerm, faktiske Viking-bilder og keying prøves med det aktuelle HDMI-/ATEM-oppsettet. Automatiserte tester verifiserer ikke denne maskinvaren.

| Fil | Ansvar |
| :--- | :--- |
| `presentation.js` | Skjermvalg og styring av visningsvindu |
| `app.js` | Oppsettseditor, visning og bildeoppdatering |
| `index.html` / `style.css` | Grensesnitt og layout |
| `server.js` | Bilder, innstillinger, HTTP-styring og hendelsesstrøm |
| `config.js` | Felles lasting og validering av konfigurasjon |
| `connect-drives.ps1` | Tilkobling og kontroll av nettverksdisker |
| `start.bat` | Oppstart på Windows |
| `img/sundvolden_TV_logo.png` | Firmalogo i kontrollpanelets footer |
| `server.test.js` / `presentation.test.js` | Server-, konfigurasjons- og vindusstyringstester |

---

<div align="center">

**VikingViewer** · Bowling på skjermen, med et enkelt oppsett.

Utviklet av [Sundvolden TV](https://www.sundvolden.tv).

</div>
