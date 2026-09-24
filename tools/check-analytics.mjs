import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { parseHTML } from "linkedom";

const source = readFileSync(
  new URL("../dist/analytics.js", import.meta.url),
  "utf8",
);
const html = readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const { document: page } = parseHTML(html);
const tags = [...page.querySelectorAll('script[src^="analytics.js"]')];
assert.equal(tags.length, 1, "Only one analytics entry point");
const measurementId = tags[0].dataset.measurementId;
assert.match(measurementId, /^G-[A-Z0-9]+$/);

function simulate(url, id = measurementId, hasLink = true) {
  const scripts = [];
  const listeners = {};
  const context = {
    window: {},
    location: new URL(url),
    document: {
      currentScript: { dataset: { measurementId: id } },
      createElement: () => ({}),
      head: { append: (script) => scripts.push(script) },
      querySelector: () =>
        hasLink
          ? {
              addEventListener: (event, callback) => {
                listeners[event] = callback;
              },
            }
          : null,
    },
  };
  runInNewContext(source, context);
  return { scripts, listeners, window: context.window };
}

for (const url of [
  "http://127.0.0.1:4317/sample_food1/",
  "http://localhost:4317/sample_food1/",
  "https://example.com/sample_food1/",
  "https://onebe-inc.github.io/sample_salon1/",
]) {
  const result = simulate(url);
  assert.equal(
    result.scripts.length,
    0,
    "Preview/other sites must not load GA4",
  );
  assert.equal(result.window.gtag, undefined);
}
assert.equal(
  simulate("https://onebe-inc.github.io/sample_food1/", "").scripts.length,
  0,
);
const live = simulate("https://onebe-inc.github.io/sample_food1/#menu");
assert.equal(live.scripts.length, 1);
assert.equal(
  live.scripts[0].src,
  "https://www.googletagmanager.com/gtag/js?id=" + measurementId,
);
assert.equal(live.scripts[0].async, true);
const config = live.window.dataLayer.filter((args) => args[0] === "config");
assert.equal(config.length, 1, "One config produces one initial page view");
assert.equal(config[0][1], measurementId);
assert.equal(config[0][2].allow_google_signals, false);
assert.equal(config[0][2].allow_ad_personalization_signals, false);
assert.equal(config[0][2].cookie_path, "/sample_food1/");
// The real library may be blocked; the link handler still queues safely without delaying navigation.
assert.doesNotThrow(() => live.listeners.click());
const click = live.window.dataLayer.filter((args) => args[0] === "event");
assert.equal(click.length, 1);
assert.equal(click[0][1], "web_consultation_click");
assert.equal(click[0][2].send_to, measurementId);
assert.equal(click[0][2].link_url, "https://lin.ee/pGcDjdz");
assert.equal(
  Object.keys(click[0][2]).sort().join(","),
  "link_text,link_url,send_to",
);
assert.doesNotThrow(() =>
  simulate("https://onebe-inc.github.io/sample_food1/", measurementId, false),
);
console.log("Analytics scope, page view initialization and LINE click: PASS");
