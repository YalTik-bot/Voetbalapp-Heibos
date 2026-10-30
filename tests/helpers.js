// Gedeelde hulpjes voor de tests
const { expect } = require("@playwright/test");

// Lege app openen (geen bewaarde gegevens) en het startvenster invullen
async function freshApp(page, { date = "", opp = "", fmt = 8, time } = {}) {
  if (time) await page.clock.install({ time: new Date(time) });
  else await page.clock.install();
  page.on("dialog", (d) => d.accept()); // bevestigingsvragen automatisch met "ja" beantwoorden
  // fouten van de app zelf zichtbaar maken in het testlogboek
  page.on("pageerror", (e) => console.log("APP-FOUT:", e.message, "|", (e.stack || "").split("\n").slice(0, 3).join(" « ")));
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#mdlg")).toBeVisible();
  if (date) await page.fill("#fdate", date);
  if (opp) await page.fill("#fopp", opp);
  if (fmt === 11) await page.check("#f11");
  await page.click("#fok");
}

// Opstelling rechtstreeks zetten: velden = lijst van 4 rijen met spelernummers (index) of null
async function setLineup(page, fields) {
  await page.evaluate((fields) => {
    fields.forEach((row, f) => (S.pl[f] = row));
    save();
    render();
  }, fields);
}

// Een plaats op het zichtbare veld aantikken
async function tapSlot(page, s) {
  await page.evaluate(() => scrollTo(0, 0));
  const slot = page.locator(`.fw.vis .slot[data-s="${s}"]`);
  await slot.scrollIntoViewIfNeeded();
  // click i.p.v. tap: Safari (WebKit) op de Linux-testmachine maakt van een gesimuleerde tik geen klik
  await slot.click();
}

// Klok laten lopen: start, dan een aantal seconden vooruit
async function playSeconds(page, seconds) {
  await page.evaluate(() => scrollTo(0, 0));
  if (!(await page.locator("#go").isDisabled())) await page.tap("#go");
  await page.clock.runFor(seconds * 1000);
}

const state = (page, fn) => page.evaluate(fn);

// Een standaard 8-tegen-8-opstelling: keeper 1 en spelers 1–7 op veld 1, keeper 2 en spelers 8–14 op veld 2
const LINEUP8 = [
  [14, 0, 1, 2, 3, 4, 5, 6],
  [15, 7, 8, 9, 10, 11, 12, 13],
  Array(8).fill(null),
  Array(8).fill(null),
];

module.exports = { freshApp, setLineup, tapSlot, playSeconds, state, LINEUP8 };
