// Delen, printen, zonder internet, donkere modus, schermgroottes en oude bewaarde gegevens
const { test, expect } = require("@playwright/test");
const { freshApp, setLineup, playSeconds, state, LINEUP8 } = require("./helpers");

test("opstelling delen met een andere trainer", async ({ page, browser }) => {
  await freshApp(page, { date: "24/10/2026", opp: "KFC Essen" });
  await setLineup(page, LINEUP8);
  await page.evaluate(() => (navigator.share = async (d) => (window._shared = d)));
  await page.click("#sh");
  const shared = await state(page, () => window._shared);
  expect(shared.text).toContain("tegen KFC Essen");

  const other = await (await browser.newContext()).newPage();
  other.on("dialog", (d) => d.accept());
  await other.goto(shared.url);
  await expect(other.locator("#mdlg")).toBeHidden();
  expect(await other.evaluate(() => [S.opp, S.date, S.names[S.pl[0][0]]])).toEqual(["KFC Essen", "2026-10-24", "Keeper 1"]);
});

test("printen: 4 velden op pagina 1, bank op pagina 2, altijd wit", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "PDF maken kan alleen in Chromium");
  await freshApp(page, { opp: "KFC Essen" });
  await setLineup(page, LINEUP8);
  await page.click("#th"); // donkere modus
  await page.emulateMedia({ media: "print" });
  expect(await page.locator(".card").first().evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(255, 255, 255)");
  const pdf = await page.pdf({ format: "A4" });
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  expect(pages).toBe(2);
});

test("werkt zonder internet nadat de app één keer geopend is", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Offline herladen met service worker wordt in WebKit door Playwright niet ondersteund");
  await page.goto("/index.html");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.click("#fok");
  await page.evaluate(() => { S.names[0] = "Lucas"; save(); });
  await page.reload(); // nu beheerd door de service worker
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".pitch")).toHaveCount(4);
  expect(await state(page, () => S.names[0])).toBe("Lucas");
});

test("donkere modus blijft bewaard", async ({ page }) => {
  await freshApp(page);
  await page.click("#th");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

for (const width of [320, 390, 1280]) {
  test(`geen horizontaal scrollen op ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await freshApp(page);
    await setLineup(page, LINEUP8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test("oude bewaarde gegevens (12 veldspelers, één klok) worden correct omgezet", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/index.html");
  await page.evaluate(() => {
    const leeg = Array(8).fill(null);
    localStorage.setItem("khs_v1", JSON.stringify({
      names: [...Array.from({ length: 12 }, (_, i) => "Jan" + i), "Kees", "Piet"],
      pl: [[12, 0, 11, null, null, null, null, 13], leeg, leeg, leeg],
      sec: Array(14).fill(30), goals: [{ p: 13, m: 5 }], logo: "logo.jpg", per: 0, rem: 900, run: false, last: 0,
    }));
  });
  await page.reload();
  expect(await state(page, () => [S.names.length, S.names[14], S.names[S.pl[0][0]], S.names[S.goals[0].p]])).toEqual([16, "Kees", "Kees", "Piet"]);
});
