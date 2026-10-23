# K. Heibos S.V. Kalmthout – Opstelling & wedstrijdklok

Eenvoudige webapp om een voetbalwedstrijd van 80 minuten (4 × 20 min) te plannen en te volgen.

## Functies
- 4 halve velden met 8 posities (keeper, laatste man, links-/rechtsachter, mid, links-/rechtsvoor, spits) of 11 posities (keeper, laatste man en 3 rijen van 3)
- Reservebank met 16 spelers (14 veldspelers + 2 keepers), namen aanpasbaar en bewaard
- Aftelklok per periode met start, pauze en reset; automatische overgang naar het volgende veld
- Klok en speelminuten blijven correct bij vergrendeld scherm, wisselen van app of herladen; het scherm blijft aan zolang de klok loopt
- Speelminuten per speler: per veld (onder de speler op het veld) en in totaal (op de reservebank); alleen het lopende veld telt mee
- Doelpuntenlijst
- Printen van velden, spelers en doelpunten
- Scorebord met doelpunten van de tegenstander (knop ⚽ Tegengoal) en de stand na elk doelpunt
- Bij het opstarten: datum (typen als dd/mm/jjjj of aanklikken in de kalender), naam van de tegenstander en spelvorm (8 of 11 spelers) kiezen; later aan te passen met de datumknop 📅; spelvorm wisselen met de schakelaar 8 / 11 spelers
- Wedstrijden per datum: opstelling, tegenstander, score, doelpunten en minuten worden bewaard onder de datum; dagen met een wedstrijd hebben een ● in de kalender; onder de kalender staan de wedstrijden van de getoonde maand om ze terug te openen
- Posities verschuiven: knop ✥, sleep een positie naar een nieuwe plaats; per veld terug naar standaard
- Selecties per speler: ●●○○ 2/4 toont op welke en hoeveel van de 4 velden een speler staat (rood = minst geselecteerd), met een regel wie het minst geselecteerd is; de keuzelijst zet die spelers bovenaan
- Speeltijd in één oogopslag: per speler een balk met de gespeelde minuten, rood (speelde het minst), oranje of groen (al veel)
- Doelpunt: knop „⚽ Goal Heibos” onder de score toont de spelers van het lopende veld (ook „Andere speler…”), of tik op de speler en kies „⚽ Doelpunt”; na elk doelpunt (ook een tegengoal) kan je het 4 seconden lang ongedaan maken; tik op de melding om ze te sluiten
- Speler aanpassen: keuzelijst met eerst de bank, dan wie al op het veld staat (wisselen van plaats, niemand valt weg); tijdens de wedstrijd kies je 🔁 Wissel of ✏️ Verbeteren (fout ingegeven: minuten gaan naar de juiste speler, geen wissel in het verloop)
- Wissels tijdens een periode: een speler vervangen op het lopende veld wordt met de minuut in het wedstrijdverloop gezet
- Seizoensoverzicht (📊): uitslagen, gewonnen/gelijk/verloren, doelsaldo, topschutters en per speler wedstrijden, minuten, doelpunten en posities
- Signaal: 2 minuten voor het einde van een veld een piep en trilling, op het einde 3 piepen
- Werkt zonder internet nadat de app één keer geopend is (service worker `sw.js`)
- Velden met de keeper onderaan: de ploeg speelt naar boven, zodat links en rechts kloppen met wat de spelers zien
- Opstelling delen: knop 📤 maakt een link met namen en opstelling; wie de link opent kan ze overnemen
- Donkere modus (knop 🌙/☀️ rechtsboven; volgt standaard de instelling van het toestel)
- Handig op de GSM: klok blijft bovenaan staan, tabbladen per veld, tik een positie om een speler te kiezen, als app op het beginscherm te zetten
- Clublogo (klik op het logo om een ander logo te kiezen)

Alle gegevens worden lokaal in de browser bewaard (localStorage). Er is geen server nodig.

## Gebruiken
Open `index.html` in een browser, of publiceer via GitHub Pages.

## Publiceren met GitHub Pages
1. Maak een nieuwe repository op GitHub en upload alle bestanden uit deze map.
2. Ga naar **Settings → Pages**.
3. Kies bij *Source* **Deploy from a branch**, branch `main`, map `/ (root)`, en klik **Save**.
4. Na een minuut staat de app op `https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`.

## Publiceren op Railway
De repository bevat een `Dockerfile` en `Caddyfile`: Railway bouwt daarmee een kleine webserver (Caddy) die de app toont.
1. In Railway: **New Project → Deploy from GitHub repo** en kies deze repository (branch `main`).
2. Railway herkent de `Dockerfile` en bouwt automatisch; elke merge naar `main` zet een nieuwe versie online.
3. Ga naar de service → **Settings → Networking → Generate Domain** en pas de naam aan, bv. `heibos.up.railway.app`.

Nieuwe bestanden voor de app moeten ook in de `COPY`-regel van de `Dockerfile` komen.

## Na een aanpassing
Verhoog het versienummer achter `style.css?v=` en `app.js?v=` in `index.html` en in `sw.js` (ook de naam van de cache daar), zodat browsers de nieuwe bestanden ophalen in plaats van een oude bewaarde kopie.

## Bestanden
| Bestand | Inhoud |
|---|---|
| `index.html` | pagina |
| `style.css` | opmaak (licht/donker, print) |
| `app.js` | logica (opstelling, klok, doelpunten) |
| `logo.jpg` | clublogo |
| `Dockerfile`, `Caddyfile` | webserver voor Railway |
| `sw.js` | kopie van de app voor gebruik zonder internet |
| `manifest.json` | instellingen om de app op het beginscherm te zetten |
