import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "dist/index.html",
  "dist/404.html",
  "dist/style.css",
  "dist/app.js",
  "dist/assets/favicon.svg",
];
const signatures = [
  /googletagmanager|google-analytics|gtag\s*\(/gi,
  /HAIR\s*&(?:amp;)?\s*TIME|ヘアサロン|ai-hero-salon/gi,
  /minna-no-ginko\.com|fujiya1935\.com|wp-content/gi,
];
const findings = files.flatMap((file) => {
  const source = readFileSync(resolve(root, file), "utf8");
  return signatures.flatMap((pattern) =>
    [...source.matchAll(pattern)].map((match) => ({ file, marker: match[0] })),
  );
});
const report = {
  checkedAt: new Date().toISOString(),
  status: findings.length ? "FAIL" : "PASS",
  scope: files,
  findings,
  limitations: [
    "Marker checks only; not comprehensive security or copyright clearance.",
    "Image provenance is recorded separately in ASSETS.md.",
  ],
};
mkdirSync(resolve(root, "provenance/verification"), { recursive: true });
writeFileSync(
  resolve(root, "provenance/verification/source.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log("Published-source marker audit: " + report.status);
if (findings.length) process.exitCode = 1;
