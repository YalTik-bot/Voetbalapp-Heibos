// Doelpunten, tegengoals, wissels, verbeteren en ongedaan maken
const { test, expect } = require("@playwright/test");
const { freshApp, setLineup, tapSlot, playSeconds, state, LINEUP8 } = require("./helpers");

test.beforeEach(async ({ page }) => {
  await freshApp(page, { opp: "KFC Essen" });
  await setLineup(page, LINEUP8);
  await playSeconds(page, 5 * 60);
});

test("Goal Heibos: spelers van het lopende veld, andere speler en ongedaan maken", async ({ page }) => {
  await page.click("#ug");
  await expect(page.locator("#gt")).toContainText("Wie scoorde? · veld 1 · 6'");
  await expect(page.locator("#glist .gs")).toHaveCount(8);
  await page.click('[data-gscorer="3"]');
  await expect(page.locator("#score")).toHaveText("1 – 0");
  await expect(page.locator("#toast")).toContainText("Doelpunt Speler 4 (6')");
  await page.click("[data-undo]");
  await expect(page.locator("#score")).toHaveText("0 – 0");

  await page.click("#ug");
  await page.click("[data-gmore]");
  await expect(page.locator("#glist .gs")).toHaveCount(8); // de spelers die niet op het veld staan
  await page.click('[data-gscorer="9"]');
  await expect(page.locator("#goals")).toContainText("Speler 10");
});

test("doelpunt via het spelersvenster en tegengoal met stand", async ({ page }) => {
  await tapSlot(page, 7);
  await expect(page.locator("#pact .gbtn")).toHaveText("⚽ Doelpunt voor Speler 7");
  await page.click("#pact .gbtn");
  await page.click("#og");
  await expect(page.locator("#score")).toHaveText("1 – 1");
  await expect(page.locator("#goals")).toContainText("KFC Essen");
  await expect(page.locator("#goals tr").last()).toContainText("1–1");
});

test("melding verdwijnt na 4 seconden; ongedaan na ✕ verwijdert geen ander doelpunt", async ({ page }) => {
  await page.click("#ug");
  await page.click('[data-gscorer="1"]');
  await page.clock.runFor(4300);
  await expect(page.locator("#toast")).toBeHidden();
  await page.click("#ug");
  await page.click('[data-gscorer="2"]');
  await page.evaluate(() => document.querySelector('[data-del="1"]').click());
  await page.evaluate(() => document.querySelector("[data-undo]").click());
  expect(await state(page, () => S.goals.map((g) => S.names[g.p]))).toEqual(["Speler 2"]);
});

test("wissel in stappen: wie gaat eruit, wie komt erin, met correcte minuten en ongedaan maken", async ({ page }) => {
  await page.evaluate(() => scrollTo(0, 0));
  await page.click("#wis");
  await expect(page.locator("#gt")).toContainText("wie gaat eruit?");
  await page.click('[data-swout="4"]');
  await expect(page.locator("#gt")).toHaveText("🔁 Wie komt erin voor Speler 4?");
  await page.click("[data-swback]");
  await expect(page.locator("#gt")).toContainText("wie gaat eruit?");
  await page.click('[data-swout="4"]');
  await page.click('[data-swin="8"]');
  await expect(page.locator("#goals")).toContainText("Speler 9 erin voor Speler 4");
  await page.clock.runFor(2000);
  await page.click("[data-undo]");
  expect(await state(page, () => [S.pl[0][4], S.subs.length])).toEqual([3, 0]);
  expect(await state(page, () => [S.fsec[0][3] >= 301, S.fsec[0][8]])).toEqual([true, 0]); // minuten terug bij Speler 4
});

test("keuzemenu tijdens de wedstrijd: wisselen en verkeerde speler verbeteren", async ({ page }) => {
  await tapSlot(page, 4);
  await expect(page.locator("#pact button")).toHaveCount(5);
  await page.click('[data-act="sub"]');
  await page.click('[data-swin="8"]');
  await page.clock.runFor(60 * 1000);
  // Speler 9 was fout, het moest Speler 10 zijn
  await tapSlot(page, 4);
  await page.click('[data-act="fix"]');
  await expect(page.locator("#gt")).toHaveText("✏️ Wie stond er eigenlijk i.p.v. Speler 9?");
  await page.click('[data-swin="9"]');
  expect(await state(page, () => [S.pl[0][4], S.fsec[0][8], S.fsec[0][9] >= 60, S.subs.length])).toEqual([9, 0, true, 1]);
  await expect(page.locator("#goals")).toContainText("Speler 10 erin voor Speler 4");
});
