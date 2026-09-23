import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sources = {
  "ogp-wanbi.png": {
    source: "User-provided approved design PNG, copied unchanged",
    use: "OGP and CSS image sprites",
  },
  "restaurant-interior.png": {
    source: "image_gen__imagegen, generated with approved design as reference",
    use: "Hero and interior section",
  },
  "favicon.svg": {
    source: "Created for this implementation",
    use: "Site icon",
  },
};
const assets = Object.entries(sources).map(([name, details]) => {
  const bytes = readFileSync(resolve(root, "dist/assets", name));
  return {
    file: "dist/assets/" + name,
    ...details,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    ...(name.endsWith(".png")
      ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
      : {}),
  };
});
writeFileSync(
  resolve(root, "provenance/asset-manifest.json"),
  JSON.stringify({ date: "2026-09-24", assets }, null, 2) + "\n",
);
console.log("Asset manifest written: " + assets.length + " assets.");
