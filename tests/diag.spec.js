// TIJDELIJK: welke elementen zijn breder dan een scherm van 320 px in Safari?
const { test } = require("@playwright/test");
const { freshApp, setLineup, LINEUP8 } = require("./helpers");
test("diagnose breedte 320", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await freshApp(page);
  await setLineup(page, LINEUP8);
  const info = await page.evaluate(() => {
    const W = innerWidth, out = [];
    document.querySelectorAll("body *").forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && r.right > W + 0.5) out.push((e.id ? "#" + e.id : e.tagName.toLowerCase() + "." + [...e.classList].join(".")) + " right=" + Math.round(r.right) + " w=" + Math.round(r.width)); });
    return { W, sw: document.documentElement.scrollWidth, out: out.slice(0, 15) };
  });
  console.log(`BREED ${browserName}: ` + JSON.stringify(info));
});
