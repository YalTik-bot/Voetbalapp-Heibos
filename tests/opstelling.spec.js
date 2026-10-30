// Spelers, opstellen, keuzemenu voor de aftrap, selecties per veld, velden en posities verschuiven
const { test, expect } = require("@playwright/test");
const { freshApp, setLineup, tapSlot, state, LINEUP8 } = require("./helpers");

test("16 spelers: 14 veldspelers en 2 keepers in het zwart, keepers bovenaan bij de keeperpositie", async ({ page }) => {
  await freshApp(page);
  await expect(page.locator(".b")).toHaveCount(16);
  await tapSlot(page, 0);
  const eerste = await page.locator("#plist .pi span").evaluateAll((e) => e.slice(0, 2).map((x) => x.firstChild.textContent));
  expect(eerste).toEqual(["Keeper 1", "Keeper 2"]);
  await page.click('#plist [data-pick="14"]');
  await expect(page.locator('.fw.vis .slot[data-s="0"] rect')).toHaveAttribute("fill", "#111");
});

test("velden met de keeper onderaan en de spits bovenaan", async ({ page }) => {
  await freshApp(page);
  const top = (s) => page.locator(`.fw.vis .slot[data-s="${s}"]`).evaluate((e) => parseFloat(e.style.top));
  expect(await top(0)).toBeGreaterThan(85); // keeper
  expect(await top(7)).toBeLessThan(15); // spits
  expect(await page.locator(`.fw.vis .slot[data-s="2"]`).evaluate((e) => parseFloat(e.style.left))).toBeLessThan(50); // linksachter links
});

test("tik op een speler voor de aftrap: vervangen, van het veld halen (ongedaan) en van plaats wisselen", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await tapSlot(page, 3);
  await expect(page.locator("#pact .gbtn")).toHaveCount(0); // geen doelpunt voor de aftrap
  await expect(page.locator('[data-act="sub"]')).toContainText("Vervangen");
  await page.click('[data-act="sub"]');
  await page.click('[data-swin="9"]');
  expect(await state(page, () => S.pl[0][3])).toBe(9);
  expect(await state(page, () => S.subs.length)).toBe(0); // voor de aftrap geen wissel in het verloop

  await tapSlot(page, 3);
  await page.click('[data-act="clear"]');
  expect(await state(page, () => S.pl[0][3])).toBeNull();
  await page.click("[data-undo]");
  expect(await state(page, () => S.pl[0][3])).toBe(9);

  await tapSlot(page, 3);
  await page.click('[data-act="move"]');
  await page.click('#plist [data-pick="0"]'); // met speler 1 (laatste man) van plaats wisselen
  expect(await state(page, () => [S.pl[0][1], S.pl[0][3]])).toEqual([9, 0]);
});

test("selecties per speler: ●●○○ en wie het minst geselecteerd is", async ({ page }) => {
  await freshApp(page);
  await expect(page.locator("#selsum")).toHaveText("Nog niemand opgesteld.");
  await setLineup(page, [[14, 0, 1, 2, 3, 4, 5, 6], [14, 0, 1, 7, 8, 10, 11, 12], [15, 0, 4, 5, 6, 7, 8, 11], [15, 0, 1, 4, 5, 11, 12, 13]]);
  const speler = (n) => page.locator(".b", { has: page.locator(`input[value="${n}"]`) }).locator(".s4");
  await expect(speler("Speler 1")).toHaveText("●●●● 4/4");
  await expect(speler("Speler 10")).toHaveText("○○○○ 0/4");
  await expect(speler("Speler 10")).toHaveClass(/low/);
  await expect(page.locator("#selsum")).toContainText("Speler 10");
});

test("posities verschuiven door te slepen en terug naar standaard", async ({ page }) => {
  await freshApp(page);
  await page.click("#mv");
  const slot = page.locator('.fw.vis .slot[data-s="7"]');
  await slot.scrollIntoViewIfNeeded();
  const r = await slot.boundingBox();
  const pitch = await page.locator(".fw.vis .pitch").boundingBox();
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(pitch.x + pitch.width * 0.3, pitch.y + pitch.height * 0.4, { steps: 5 });
  await page.mouse.up();
  expect(await state(page, () => S.xy[8][0][7])).toEqual([30, 40]);
  await page.reload();
  await page.click("#fok");
  await expect(page.locator('.fw.vis .slot[data-s="7"]')).toHaveAttribute("style", /left:\s*30%;\s*top:\s*40%/);
  await page.click("#mv");
  await page.click('.fw.vis [data-rxy="0"]');
  expect(await state(page, () => S.xy[8][0][7])).toBeUndefined();
});

// Regressie: in Safari was de lijst in het spelersvenster 0 px hoog (leeg venster)
test("spelerslijst bij een lege plaats is zichtbaar en tikbaar", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, [[14, 0, 1, null, null, null, null, null], ...Array(3).fill(Array(8).fill(null))]);
  await tapSlot(page, 7);
  const list = page.locator("#plist");
  await expect(list).toBeVisible();
  expect((await list.boundingBox()).height).toBeGreaterThan(200);
  const first = page.locator("#plist .pi").first();
  await expect(first).toBeInViewport();
  await first.click();
  expect(await state(page, () => S.pl[0][7])).not.toBeNull();
});

test("venster Goal Heibos en wisselstappen tonen hun knoppen", async ({ page }) => {
  await freshApp(page);
  await setLineup(page, LINEUP8);
  await page.click("#ug");
  expect((await page.locator("#glist").boundingBox()).height).toBeGreaterThan(200);
  await expect(page.locator("#glist .gs").first()).toBeInViewport();
});
