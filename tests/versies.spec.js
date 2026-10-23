// Controle zonder browser: versienummers en bestanden moeten overal overeenkomen,
// anders krijgen gebruikers een mengeling van oude en nieuwe bestanden.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

test("versienummer gelijk in index.html en sw.js", () => {
  const html = read("index.html"), sw = read("sw.js");
  const css = html.match(/style\.css\?v=(\d+)/)[1];
  const js = html.match(/app\.js\?v=(\d+)/)[1];
  expect(js).toBe(css);
  expect(sw).toContain(`"style.css?v=${css}"`);
  expect(sw).toContain(`"app.js?v=${js}"`);
  expect(sw).toContain(`const CACHE="heibos-v${css}"`);
});

test("Dockerfile (Railway) bevat alle bestanden van de app", () => {
  const docker = read("Dockerfile");
  for (const f of ["index.html", "style.css", "app.js", "sw.js", "manifest.json", "logo.jpg"]) expect(docker).toContain(f);
});

test("app.js en sw.js zijn geldige JavaScript", () => {
  for (const f of ["app.js", "sw.js"]) expect(() => new Function(read(f))).not.toThrow();
});
