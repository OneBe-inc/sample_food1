import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(
  readFileSync(resolve(root, "provenance/page-register.json"), "utf8"),
);
const base = new URL(process.argv[2] || "http://127.0.0.1:4317/sample_food1/");
if (!["127.0.0.1", "localhost", "onebe-inc.github.io"].includes(base.hostname))
  throw new Error("Host is outside this project allowlist");
const results = [];
async function inspect(path, expectedStatus) {
  const url = new URL(path, base).href;
  const response = await fetch(url, { redirect: "follow" });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  results.push({
    rule_id: "V01/V06",
    url,
    status: response.status === expectedStatus ? "PASS" : "FAIL",
    expected: expectedStatus,
    actual: response.status,
    evidence: response.url,
    checked_at: new Date().toISOString(),
    environment: base.origin,
  });
  if (contentType.includes("text/html")) {
    const { document } = parseHTML(body);
    const robots = document.querySelector('meta[name="robots"]')?.content;
    results.push({
      rule_id: "V03",
      url,
      status: robots === "noindex,nofollow" ? "PASS" : "FAIL",
      expected: "noindex,nofollow",
      actual: robots,
      evidence: { http: response.headers.get("x-robots-tag"), html: robots },
      checked_at: new Date().toISOString(),
      environment: base.origin,
    });
    if (expectedStatus === 200) {
      results.push({
        rule_id: "V02",
        url,
        status:
          document.body.textContent.includes("ワンビー食堂") &&
          document.body.textContent.includes("¥1,100")
            ? "PASS"
            : "FAIL",
        expected: "Primary copy and prices in raw HTML",
        actual: document.title,
        evidence: "GET response, no browser execution",
        checked_at: new Date().toISOString(),
        environment: base.origin,
      });
      const files = [
        ...new Set(
          [
            ...document.querySelectorAll(
              '[src],link[rel="stylesheet"],link[rel="icon"]',
            ),
          ]
            .map((n) => n.getAttribute("src") || n.getAttribute("href"))
            .filter((v) => v && !v.startsWith("http")),
        ),
      ];
      for (const file of files) {
        const asset = await fetch(new URL(file, base));
        await asset.arrayBuffer();
        results.push({
          rule_id: "V11",
          url: new URL(file, base).href,
          status: asset.status === 200 ? "PASS" : "FAIL",
          expected: 200,
          actual: asset.status,
          evidence: asset.headers.get("content-type"),
          checked_at: new Date().toISOString(),
          environment: base.origin,
        });
      }
    }
  }
}
await inspect("", 200);
await inspect("not-a-real-page/", 404);
mkdirSync(resolve(root, "provenance/verification"), { recursive: true });
writeFileSync(
  resolve(root, "provenance/verification/http.json"),
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) +
    "\n",
);
console.log(
  "HTTP verification: " +
    results.filter((r) => r.status === "PASS").length +
    " PASS, " +
    results.filter((r) => r.status === "FAIL").length +
    " FAIL.",
);
if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
