import {
  readFileSync,
  existsSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { parseHTML } from "linkedom";
import { XMLParser, XMLValidator } from "fast-xml-parser";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFileSync(resolve(root, name), "utf8");
const registry = JSON.parse(read("provenance/page-register.json"));
const results = [];
function check(rule_id, url, expected, actual, ok, evidence) {
  results.push({
    rule_id,
    url,
    status: ok ? "PASS" : "FAIL",
    expected,
    actual,
    evidence,
    checked_at: new Date().toISOString(),
    environment: "local/static",
  });
}
for (const page of registry.pages) {
  const html = read(page.file);
  const { document } = parseHTML(html);
  const url = new URL(page.path.replace(/^\//, ""), registry.siteUrl).href;
  const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
  const robots = [...document.querySelectorAll('meta[name="robots"]')];
  check(
    "V03",
    url,
    page.indexPolicy,
    robots.map((n) => n.content).join(","),
    robots.length === 1 && robots[0].content === page.indexPolicy,
    page.file,
  );
  check(
    "V19",
    url,
    "One nonempty h1",
    document.querySelectorAll("h1").length,
    document.querySelectorAll("h1").length === 1 &&
      !!document.querySelector("h1").textContent.trim(),
    page.file,
  );
  check(
    "V07",
    url,
    "Unique nonempty title and Japanese language",
    document.title,
    document.querySelectorAll("title").length === 1 &&
      document.title.trim().length > 0 &&
      document.documentElement.lang === "ja",
    page.file,
  );
  check(
    "V11",
    url,
    "Unique IDs",
    ids.length,
    new Set(ids).size === ids.length,
    page.file,
  );
  const canonical = [...document.querySelectorAll('link[rel="canonical"]')];
  check(
    "V05",
    url,
    page.canonical,
    canonical.map((n) => n.href),
    page.canonical
      ? canonical.length === 1 && canonical[0].href === page.canonical
      : canonical.length === 0,
    page.file,
  );
  for (const element of document.querySelectorAll("[href],[src]")) {
    const value = element.getAttribute("href") || element.getAttribute("src");
    if (!value) continue;
    if (value.startsWith("#"))
      check(
        "V11",
        url,
        "Existing fragment",
        value,
        ids.includes(value.slice(1)),
        page.file,
      );
    else if (!/^(https?:|mailto:|tel:|data:)/.test(value)) {
      const local = value.startsWith("/sample_food1/")
        ? value.slice("/sample_food1/".length)
        : value;
      const path = resolve(root, "dist", local.split("?")[0] || "index.html");
      check(
        "V11",
        url,
        "Existing local file",
        value,
        existsSync(path) && statSync(path).size > 0,
        page.file,
      );
    }
  }
  let previous = 0;
  for (const heading of document.querySelectorAll(
    "main h1,main h2,main h3,main h4,main h5,main h6",
  )) {
    const level = Number(heading.localName.slice(1));
    check(
      "V19",
      url,
      "Nonempty heading; hierarchy down by at most one",
      heading.localName + ": " + heading.textContent.trim(),
      !!heading.textContent.trim() && (previous === 0 || level <= previous + 1),
      page.file,
    );
    previous = level;
  }
  for (const img of document.querySelectorAll("img")) {
    check(
      "V13",
      url,
      "Image alt and reserved intrinsic size",
      img.getAttribute("src"),
      img.hasAttribute("alt") &&
        Number(img.getAttribute("width")) > 0 &&
        Number(img.getAttribute("height")) > 0,
      page.file,
    );
  }
  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      const data = JSON.parse(script.textContent);
      check(
        "V08",
        url,
        "WebSite only; no fictional Restaurant claims",
        data["@type"],
        data["@type"] === "WebSite" &&
          data.url === registry.siteUrl &&
          data.name.includes("サンプル"),
        page.file,
      );
    } catch (error) {
      check("V08", url, "Valid JSON-LD", error.message, false, page.file);
    }
  }
  for (const field of document.querySelectorAll("input,select,textarea")) {
    check(
      "V13",
      url,
      "Accessible field label",
      field.id,
      !!document.querySelector('label[for="' + field.id + '"]'),
      page.file,
    );
  }
}
const { document } = parseHTML(read("dist/index.html"));
for (const property of [
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:type",
  "og:image:width",
  "og:image:height",
]) {
  check(
    "V07",
    registry.siteUrl,
    "One " + property,
    document.querySelectorAll('meta[property="' + property + '"]').length,
    document.querySelectorAll('meta[property="' + property + '"]').length === 1,
    "dist/index.html",
  );
}
check(
  "OGP",
  registry.siteUrl,
  "Supplied image, correct absolute URL",
  document.querySelector('meta[property="og:image"]').content,
  document.querySelector('meta[property="og:image"]').content ===
    registry.siteUrl + "assets/ogp-wanbi.png",
  "dist/index.html",
);
const ogp = readFileSync(resolve(root, "dist/assets/ogp-wanbi.png"));
check(
  "OGP",
  registry.siteUrl,
  "Original attachment unchanged",
  createHash("sha256").update(ogp).digest("hex"),
  createHash("sha256").update(ogp).digest("hex") ===
    "17283bbce9ea4e56664782c8a7f81fcc38baea695d7d68ae61976551c03cf949",
  "dist/assets/ogp-wanbi.png",
);
check(
  "OGP",
  registry.siteUrl,
  "1448x1086 PNG",
  [ogp.readUInt32BE(16), ogp.readUInt32BE(20)],
  ogp.readUInt32BE(16) === 1448 && ogp.readUInt32BE(20) === 1086,
  "dist/assets/ogp-wanbi.png",
);
for (const name of ["restaurant-interior.png", "ogp-wanbi.png"]) {
  const bytes = readFileSync(resolve(root, "dist/assets", name));
  check(
    "V13",
    registry.siteUrl,
    "Nonempty valid PNG signature",
    name,
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
      bytes.length > 10000,
    "dist/assets/" + name,
  );
}
const xml = read("dist/sitemap.xml");
const validXml = XMLValidator.validate(xml);
const sitemap = validXml === true ? new XMLParser().parse(xml) : null;
check(
  "V05",
  registry.siteUrl + "sitemap.xml",
  "Valid XML; no noindex URLs",
  sitemap,
  validXml === true && !sitemap.urlset?.url,
  "dist/sitemap.xml",
);
const combined =
  read("dist/index.html") + read("dist/app.js") + read("dist/style.css");
execFileSync(process.execPath, [resolve(root, "tools/check-analytics.mjs")], {
  stdio: "inherit",
});
check(
  "V12",
  registry.siteUrl,
  "Authorized GA4; production scope and LINE click verification",
  "Analytics behavior checks passed",
  true,
  "tools/check-analytics.mjs",
);
const js = read("dist/app.js");
check(
  "V12",
  registry.siteUrl,
  "No form network transmission or persistence",
  "source scan",
  !/(fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)/.test(
    js,
  ),
  "dist/app.js",
);
check(
  "V16",
  registry.siteUrl,
  "No old salon content",
  "source scan",
  !/(HAIR &amp; TIME|HAIR & TIME|ヘアサロン|ai-hero-salon)/.test(combined),
  "dist/",
);
check(
  "V02",
  registry.siteUrl,
  "Primary content in initial HTML",
  "menu and price",
  document.body.textContent.includes("ケチャップオムライス") &&
    document.body.textContent.includes("¥1,100") &&
    document.body.textContent.includes("ワンビー食堂"),
  "dist/index.html",
);
execFileSync(process.execPath, ["--check", resolve(root, "dist/app.js")], {
  stdio: "inherit",
});
mkdirSync(resolve(root, "provenance/verification"), { recursive: true });
writeFileSync(
  resolve(root, "provenance/verification/static.json"),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      summary: {
        pass: results.filter((r) => r.status === "PASS").length,
        fail: results.filter((r) => r.status === "FAIL").length,
      },
      results,
    },
    null,
    2,
  ) + "\n",
);
for (const result of results.filter((r) => r.status === "FAIL"))
  console.error(result);
console.log(
  "Static verification: " +
    results.filter((r) => r.status === "PASS").length +
    " PASS, " +
    results.filter((r) => r.status === "FAIL").length +
    " FAIL.",
);
if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
