// TIJDELIJK: diagnose voor het lege spelersvenster in Safari
const { test } = require("@playwright/test");
const { freshApp, setLineup } = require("./helpers");

for (const how of ["tap", "click"]) {
  test(`diagnose venster via ${how}`, async ({ page, browserName }) => {
    await freshApp(page);
    await setLineup(page, [[14, 0, 1, null, null, null, null, null], ...Array(3).fill(Array(8).fill(null))]);
    await page.evaluate(() => {
      window._log = [];
      document.addEventListener("click", (e) => window._log.push("click:" + (e.target.className || e.target.tagName) + "/" + (e.target.closest(".slot") ? "slot" : "-")), true);
      const o = openPick;
      window.openPick = function (...a) {
        window._log.push("openPick(" + a.join(",") + ")");
        try { const r = o.apply(this, a); window._log.push("openPick klaar"); return r; } catch (err) { window._log.push("FOUT " + err.message); throw err; }
      };
    });
    const slot = page.locator('.fw.vis .slot[data-s="7"]');
    await slot.scrollIntoViewIfNeeded();
    if (how === "tap") await slot.tap(); else await slot.click();
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => ({
      log: window._log,
      open: document.getElementById("pick").open,
      titel: document.getElementById("pt").textContent,
      pactHidden: document.getElementById("pact").hidden,
      pactLen: document.getElementById("pact").innerHTML.length,
      plistHidden: document.getElementById("plist").hidden,
      plistLen: document.getElementById("plist").innerHTML.length,
      plistH: document.getElementById("plist").getBoundingClientRect().height,
      dlgDisplay: getComputedStyle(document.getElementById("pick")).display,
      ua: navigator.userAgent,
    }));
    console.log(`DIAG ${browserName} ${how}: ` + JSON.stringify(info));
  });
}
