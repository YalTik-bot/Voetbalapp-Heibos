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
- Bij het opstarten: datum (typen als dd/mm/jjjj of aanklikken in de kalender), naam van de tegenstander en spelvorm (8 of 11 spelers) kiezen; later aan te passen met ✎
- Posities verschuiven: knop ✥, sleep een positie naar een nieuwe plaats; per veld terug naar standaard
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

## Na een aanpassing
Verhoog het versienummer achter `style.css?v=` en `app.js?v=` in `index.html`, zodat browsers de nieuwe bestanden ophalen in plaats van een oude bewaarde kopie.

## Bestanden
| Bestand | Inhoud |
|---|---|
| `index.html` | pagina |
| `style.css` | opmaak (licht/donker, print) |
| `app.js` | logica (opstelling, klok, doelpunten) |
| `logo.jpg` | clublogo |
| `manifest.json` | instellingen om de app op het beginscherm te zetten |
