# K. Heibos S.V. Kalmthout – Opstelling & wedstrijdklok

Eenvoudige webapp om een voetbalwedstrijd van 80 minuten (4 × 20 min) te plannen en te volgen.

## Functies
- 4 halve velden met 8 posities (keeper, laatste man, links-/rechtsachter, mid, links-/rechtsvoor, spits)
- Reservebank met 14 spelers (12 veldspelers + 2 keepers), namen aanpasbaar en bewaard
- Aftelklok per periode met start, pauze en reset; automatische overgang naar het volgende veld
- Klok en speelminuten blijven correct bij vergrendeld scherm, wisselen van app of herladen; het scherm blijft aan zolang de klok loopt
- Speelminuten per speler en doelpuntenlijst
- Printen van velden, spelers en doelpunten
- Clublogo (klik op het logo om een ander logo te kiezen)

Alle gegevens worden lokaal in de browser bewaard (localStorage). Er is geen server nodig.

## Gebruiken
Open `index.html` in een browser, of publiceer via GitHub Pages.

## Publiceren met GitHub Pages
1. Maak een nieuwe repository op GitHub en upload alle bestanden uit deze map.
2. Ga naar **Settings → Pages**.
3. Kies bij *Source* **Deploy from a branch**, branch `main`, map `/ (root)`, en klik **Save**.
4. Na een minuut staat de app op `https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`.

## Bestanden
| Bestand | Inhoud |
|---|---|
| `index.html` | pagina |
| `style.css` | opmaak (licht/donker, print) |
| `app.js` | logica (opstelling, klok, doelpunten) |
| `logo.jpg` | clublogo |
