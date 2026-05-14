import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "brainrots");
fs.mkdirSync(dir, { recursive: true });

for (let i = 13; i <= 49; i++) {
  const h = (i * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Brainrot ${i}">
  <rect width="120" height="120" rx="18" fill="hsl(${h} 58% 42%)"/>
  <circle cx="60" cy="52" r="20" fill="#fff" opacity="0.9"/>
  <circle cx="52" cy="48" r="4" fill="#0f172a"/><circle cx="68" cy="48" r="4" fill="#0f172a"/>
  <path d="M48 60 Q60 70 72 60" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
  <text x="60" y="102" text-anchor="middle" fill="#fff" font-size="10" font-family="system-ui,sans-serif" font-weight="700">#${i}</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `br-${i}.svg`), svg, "utf8");
}
console.log("Wrote br-13.svg … br-49.svg");
