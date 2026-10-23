// Wedstrijdklok: start/pauze, speelminuten, vergrendeld scherm, signaal en volgende veld
const { test, expect } = require("@playwright/test");
const { freshApp, setLineup, playSeconds, state, LINEUP8 } = require("./helpers");

test.beforeEach(async ({ page }) => {
  // trillen bijhouden (de testbrowser kan niet echt trillen)
  await page.addInitScript(() => {
    window._vib = [];
    navigator.vibrate = (v) => (window._vib.push(JSON.stringify(v)), true);
  });
});

test("start en pauze: trilling, kleur, grijze knoppen en melding", async ({ page }) => {
  await freshApp(page);
  await expect(page.locator("#pa")).toBeDisabled();
  await page.click("#go");
  await expect(page.locator("#bar")).toHaveClass(/running/);
  await expect(page.locator("#per")).toContainText("● Loopt");
  await expect(page.locator("#go")).toBeDisabled();
  await expect(page.locator("#toast")).toContainText("Klok gestart");
  await page.clock.runFor(5000);
  await page.click("#pa");
  await expect(page.locator("#bar")).toHaveClass(/paused/);
  await expect(page.locator("#toast")).toContainText("Gepauzeerd op 19:55");
  expect(await state(page, () => window._vib)).toEqual(["60", "[40,60,40]"]);
});

test("speelminuten tellen enkel voor spelers op het lopende veld", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await playSeconds(page, 90);
  expect(await state(page, () => [S.sec[0], S.sec[7], S.fsec[0][0]])).toEqual([90, 0, 90]);
  await expect(page.locator("#clock")).toHaveText("18:30");
});

test("klok blijft kloppen na een vergrendeld scherm en na herladen, zonder signaal achteraf", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await playSeconds(page, 1);
  await page.evaluate(() => (window._vib = []));
  await page.clock.fastForward(18.5 * 60 * 1000); // scherm 18,5 minuut vergrendeld: 2-minutensignaal ligt achter ons
  await page.clock.runFor(500);
  await expect(page.locator("#clock")).toHaveText("01:29");
  expect(await state(page, () => window._vib)).toEqual([]);
  await page.reload();
  await expect(page.locator("#mdlg")).toBeHidden(); // geen startvenster als de klok loopt
  await page.clock.runFor(1000);
  await expect(page.locator("#clock")).toHaveText("01:28");
});

test("signaal 2 minuten voor en op het einde, daarna volgende veld", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await playSeconds(page, 18 * 60 + 0.5);
  await expect(page.locator("#toast")).toContainText("Nog 2 minuten op veld 1");
  await page.clock.runFor(2 * 60 * 1000 + 1000);
  await expect(page.locator("#toast")).toContainText("Einde van veld 1");
  expect(await state(page, () => window._vib.slice(-2))).toEqual(["[250]", "[400,150,400,150,400]"]);
  expect(await state(page, () => [S.per, S.rem, !!run])).toEqual([1, 1200, false]);
  await expect(page.locator(".tab.on")).toContainText("Veld 2");
});

test("reset wedstrijd zet klok, minuten en doelpunten op nul maar houdt de opstelling", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await playSeconds(page, 30);
  await page.click("#og");
  await page.click("#pa");
  await page.click("#rs");
  await expect(page.locator("#clock")).toHaveText("20:00");
  await expect(page.locator("#score")).toHaveText("0 – 0");
  expect(await state(page, () => [S.sec[0], S.pl[0][0]])).toEqual([0, 14]);
});
