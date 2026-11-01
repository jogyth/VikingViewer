VikingViewer

Start
1. Koble PC-en til Viking-nettverket med hallens tillatelse.
2. Installer Node.js (versjon 22 eller nyere). Ingen npm-pakker trengs.
3. Kopier .env.example til .env og fyll inn VIKING_USERNAME og VIKING_PASSWORD.
   Start start.bat. Den kobler til diskene O:–V: og åpner /settings.
   Alternativt: npm start (eller node server.js) og åpne http://localhost:3000/settings.
4. Velg en av seks layouter og baner 1–16 for hvert av de to oppsettene.
   Rekkefølgen er fra venstre mot høyre, deretter neste rad. En bane kan
   brukes i begge oppsett, men bare én gang innenfor samme oppsett.
5. Velg bakgrunn og trykk Launch. Oppsettene lagres i settings.json.
   Launch åpner visningen i samme fane og ber nettleseren om fullskjerm.
   Hvis nettleseren avviser forespørselen, bruk F11 eller F.

Sending
1 / 2: velg oppsett. F: fullskjerm. S: tilbake til innstillinger.
Esc: gå ut av fullskjerm. Nettleserens tilbakeknapp fungerer også.
Direkte visningsadresse: http://localhost:3000/view
Bilder oppdateres hvert femte sekund. Siste gode bilde beholdes ved feil,
med en feilmelding på den aktuelle banen. Begge oppsett deler aktivt valg
på serveren, slik at alle åpne visninger følger samme oppsett.

Layouter
1 stor: 1920 x 1080.
2, 4 eller 6 nederst: full bredde, like brede ruter og bilder bunnjustert.
4 fullskjerm: 2 x 2. 6 fullskjerm: 3 x 2.
Lerretet er alltid 1920 x 1080 og skaleres proporsjonalt til vinduet.
Hele JPEG-bildet bevares uten strekk eller beskjæring. Faktisk fylt areal
avhenger av bildeforholdet. Sett skjermutgangen til 1920 x 1080 for 1:1.

Bakgrunn og ATEM
Sort er standard for HDMI. Transparent er tilgjengelig for f.eks. en
OBS-nettleserkilde (1920 x 1080, URL /view). JPEG-bildene er fortsatt
ugjennomsiktige, inkludert eventuell sort bakgrunn inne i selve bildet.
Transparent CSS gir ikke alpha over en vanlig HDMI-skjermutgang.
For å slippe luma/chroma key på ATEM kreves en støttet key/fill-signalvei.
ATEM-dokumentasjon: https://documents.blackmagicdesign.com/UserManuals/ATEM_Mini_Manual.pdf

Bitfocus Companion (på samme PC)
Legg til forbindelsen Generic: HTTP Requests. Bruk handling med POST,
uten nødvendig body, til en av disse URL-ene:
  http://127.0.0.1:3000/api/layout/1
  http://127.0.0.1:3000/api/layout/2
  http://127.0.0.1:3000/api/layout/toggle
Status kan leses med GET http://127.0.0.1:3000/api/state.
Endringer sendes til åpne visninger via Server-Sent Events.
Dokumentasjon: https://bitfocus.io/connections/generic-http
Serveren lytter bare på 127.0.0.1. Companion på en annen maskin får ikke tilgang.

Disker
Baner 1–2: O:, 3–4: P:, 5–6: Q:, 7–8: R:, 9–10: S:, 11–12: T:,
13–14: U:, 15–16: V:. Fil: Viking2001\GameCtrl\VTVFile<BANE>.jpg.
Start Node i samme vanlige Windows-brukerøkt som de mappede diskene.
Lokal nettverkspålogging ligger i .env. Denne filen ignoreres av Git.
Del .env.example med prosjektet, og behold .env lokalt.
Stopp serveren ved å avslutte Node-prosessen. start.bat starter den i bakgrunnen.

Kontroll
Kjør npm test (eller node --test server.test.js) for tester av validering, alle seks layouter,
lagring, HTTP-styring, hendelsesstrøm og avvisning av fremmed web-origin.
Testene bruker en separat midlertidig mappe og endrer ikke innstillingene.

Robust disktilkobling ved oppstart
start.bat kjorer connect-drives.ps1 med Windows PowerShell. Riktige eksisterende
SMB-tilkoblinger gjenbrukes uten nye net use-kommandoer (unngaar feil 85).
Hvis en diskbokstav peker et annet sted, vises en advarsel. Den slettes eller
omkobles aldri automatisk. Tilkoblinger med IP-adresse regnes som en annen
sti enn slave-navnet og maa avklares manuelt, selv om de kan peke til samme PC.
Manglende tilkoblinger faar inntil tre forsok med to sekunders mellomrom.
Begge bildefilene paa hver disk kontrolleres: alle baner 1-16 oppsummeres.
Ved vedvarende feil vises ogsaa resultat av navneoppslag. Dette reparerer
ikke DNS/nettverksoppsett; sammenlign med en fungerende PC ved feil.
Visningen starter selv om enkelte baner mangler. Ingen disker slettes.
For bare nettverkskontroll: powershell.exe -NoProfile -File .\connect-drives.ps1

Lokal konfigurasjon
.env leses av config.js med innebygd Node-stotte, uten npm-pakker.
Bade serveren og disktilkoblingen bruker samme konfigurasjon.
Miljovariabler overstyrer .env. Manglende .env bruker standard diskoppsett,
men nye nettverkstilkoblinger krever brukernavn og passord.
VIKING_HOST_PREFIX angir prefikset for maskiner 1-8 (standard slave).
VIKING_SHARE angir delingen (standard c$). VIKING_DRIVES inneholder atte
ulike diskbokstaver i banerekkefolge, to baner per disk.
VIKING_IMAGE_DIR er relativ bildemappe under delingen. Filnavnene er
fortsatt VTVFile1.jpg til VTVFile16.jpg. Porten er fortsatt 3000.
Verdier med # eller mellomrom kan omsluttes av doble anforselstegn.
.env er ren tekst: del den ikke med andre. Eksisterende kopier eller
Git-historikk med hardkodet palogging blir ikke endret av denne flyttingen.
