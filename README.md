<div align="center">

# 🎳 VikingViewer

**Fra bowlingbanen til skjermen.**

En lettvektsvisning av Viking Scoring for sending, storskjerm og OBS.  
16 baner · 6 layouter · 2 oppsett · ingen eksterne pakker

![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Windows](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zero dependencies](https://img.shields.io/badge/Dependencies-0-22C55E?style=flat-square)

[Kom i gang](#kom-i-gang) · [Layouter](#layouter) · [Konfigurasjon](#konfigurasjon) · [Companion](#bitfocus-companion) · [Feilsøking](#feilsøking)

</div>

---

## Én visning, flere måter å sende på

VikingViewer henter JPEG-bilder fra Viking Scoring-maskinene og viser valgte baner i nettleseren. Klargjør to oppsett, start visningen og bytt underveis med tastaturet eller Bitfocus Companion.

- **Seks layouter:** én stor bane, to til seks nederst eller et rutenett.
- **To lagrede oppsett:** velg baner og rekkefølge for hvert oppsett.
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

Velg layout og baner for begge oppsettene, velg bakgrunn og trykk **Launch**.

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
| **2 nederst** | To like brede ruter, bunnjustert | 2 |
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
| **S** | Tilbake til innstillinger |
| **Esc** | Avslutt fullskjerm |

Launch ber også om fullskjerm. Hvis nettleseren avviser forespørselen, bruk **F11** eller **F**.

## Konfigurasjon

Begge delene av prosjektet leser samme konfigurasjon: PowerShell bruker den til disktilkobling, og Node-serveren bruker den til å finne bildene. Miljøvariabler overstyrer verdiene i `.env`.

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

Oppsett og bakgrunn lagres automatisk når du trykker **Lagre innstillinger** eller **Launch**. De ligger i lokal `settings.json`, som også ignoreres av Git. Porten er fast satt til **3000**.

## OBS, HDMI og ATEM

### OBS

Legg til en **nettleserkilde** med:

| Innstilling | Verdi |
| :--- | :--- |
| URL | `http://localhost:3000/view` |
| Bredde | `1920` |
| Høyde | `1080` |
| Bakgrunn i VikingViewer | **Transparent** ved behov |

### HDMI / ATEM

Bruk **sort bakgrunn** som utgangspunkt, og vis nettleseren i fullskjerm på skjermutgangen.

> [!NOTE]
> Transparent bakgrunn gjelder nettsidens bakgrunn. JPEG-bildene er fortsatt ugjennomsiktige, inkludert eventuell sort bakgrunn i bildet. Vanlig HDMI gir ikke alpha fra CSS; bruk keying eller en støttet key/fill-signalvei ved behov.

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

## Utvikling

Vanilla JavaScript i nettleseren, innebygd HTTP-server i Node og PowerShell for Windows-disktilkobling. Ingen rammeverk, eksterne npm-pakker eller byggesteg.

```powershell
npm start
npm test
```

Testene dekker konfigurasjon, validering, alle seks layouter, lagring, HTTP-styring, hendelsesstrøm og avvisning av fremmed web-origin. De kontrollerer også at konfigurasjonsfiler ikke serveres over HTTP. Testene bruker midlertidige mapper og endrer ikke dine lagrede oppsett.

| Fil | Ansvar |
| :--- | :--- |
| `app.js` | Oppsettseditor, visning og bildeoppdatering |
| `index.html` / `style.css` | Grensesnitt og layout |
| `server.js` | Bilder, innstillinger, HTTP-styring og hendelsesstrøm |
| `config.js` | Felles lasting og validering av konfigurasjon |
| `connect-drives.ps1` | Tilkobling og kontroll av nettverksdisker |
| `start.bat` | Oppstart på Windows |
| `server.test.js` | Server- og konfigurasjonstester |

---

<div align="center">

**VikingViewer** · Bowling på skjermen, med et enkelt oppsett.

</div>
