// Startvenster, datum, spelvorm, wedstrijden per datum en seizoensoverzicht
const { test, expect } = require("@playwright/test");
const { freshApp, setLineup, tapSlot, playSeconds, state, LINEUP8 } = require("./helpers");

test("startvenster: datum typen, foute datum, kalender en tegenstander", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-22T10:00:00") });
  page.on("dialog", (d) => d.accept());
  await page.goto("/index.html");
  await expect(page.locator("#mdlg")).toBeVisible();
  await expect(page.locator("#fdate")).toHaveValue("22/10/2026"); // standaard vandaag
  await page.fill("#fdate", "03092026"); // zonder schuine strepen
  await expect(page.locator(".ch b")).toHaveText(/september 2026/i);
  await page.fill("#fdate", "31/02/2026"); // bestaat niet
  await page.click("#fok");
  await expect(page.locator("#mdlg")).toBeVisible();
  await expect(page.locator("#fdate")).toHaveClass(/bad/);
  await page.click('[data-cm="1"]'); // de kalender stond op september: volgende maand = oktober
  await page.click('[data-cd="2026-10-07"]');
  await expect(page.locator("#fdate")).toHaveValue("07/10/2026");
  await page.fill("#fopp", "KFC Essen");
  await page.click("#fok");
  await expect(page.locator("#oppn")).toHaveText("KFC Essen");
  await expect(page.locator("#mdate")).toContainText("7 okt 2026");
});

test("spelvorm 8 en 11: aparte opstellingen", async ({ page }) => {
  await freshApp(page);
  await expect(page.locator(".fw.vis .slot")).toHaveCount(8);
  await page.click('[data-fmt="11"]');
  await expect(page.locator(".fw.vis .slot")).toHaveCount(11);
  await setLineup(page, [[14, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ...Array(3).fill(Array(11).fill(null))]);
  await page.click('[data-fmt="8"]');
  await expect(page.locator(".fw.vis .slot")).toHaveCount(8);
  await page.click('[data-fmt="11"]');
  expect(await state(page, () => S.pl[0].filter((x) => x != null).length)).toBe(11);
});

test("wedstrijden per datum bewaren, terug openen en seizoensoverzicht", async ({ page }) => {
  await freshApp(page, { date: "03/09/2026", opp: "KFC Essen", time: "2026-09-01T10:00:00" });
  await setLineup(page, LINEUP8);
  await playSeconds(page, 60);
  await page.click("#og"); // tegengoal: 0–1
  await page.click("#pa");

  // tweede wedstrijd op een nieuwe datum: zelfde opstelling, alles op nul
  await page.click("#me");
  await page.click('[data-cd="2026-09-10"]');
  await expect(page.locator("#fopp")).toHaveValue("");
  await page.fill("#fopp", "SK Kalmthout");
  await page.click("#fok");
  await expect(page.locator("#score")).toHaveText("0 – 0");
  expect(await state(page, () => S.pl[0][0])).toBe(14);
  await playSeconds(page, 30);
  await page.click("#ug");
  await page.click('[data-gscorer="0"]'); // 1–0
  await page.click("#pa");

  // terug naar de eerste wedstrijd
  await page.click("#me");
  await expect(page.locator(".cd.has")).toHaveCount(2);
  await page.click('.svb[data-cd="2026-09-03"]');
  await expect(page.locator("#fopp")).toHaveValue("KFC Essen");
  await page.click("#fok");
  await expect(page.locator("#score")).toHaveText("0 – 1");
  expect(await state(page, () => S.sec[0])).toBe(60);

  // na herladen nog bewaard
  await page.reload();
  await page.click("#fok");
  await expect(page.locator("#oppn")).toHaveText("KFC Essen");

  // seizoensoverzicht: 1 gewonnen, 0 gelijk, 1 verloren
  await page.click("#st");
  await expect(page.locator(".sum")).toContainText("2gespeeld");
  await expect(page.locator(".rl li")).toHaveCount(2);
  await expect(page.locator(".ts li")).toHaveText(/Speler 1\s*1/);
});

test("lijst onder de kalender toont enkel de wedstrijden van die maand", async ({ page }) => {
  await freshApp(page, { date: "03/10/2026", time: "2026-10-01T10:00:00" });
  await page.evaluate(() => {
    let d = new Date(2026, 8, 5);
    for (let k = 0; k < 20; k++) {
      const iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      S.matches[iso] = { ...JSON.parse(JSON.stringify(snap())), opp: "Ploeg " + k };
      d.setDate(d.getDate() + 7);
    }
    save();
  });
  await page.click("#me");
  const oktober = await page.locator(".svb").count();
  expect(oktober).toBeGreaterThan(0);
  expect(oktober).toBeLessThanOrEqual(6);
  await expect(page.locator("#saved")).toContainText("andere wedstrijden in andere maanden");
});
