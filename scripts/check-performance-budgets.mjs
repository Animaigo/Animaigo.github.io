import { readFile, readdir, stat } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url);
const astroDir = new URL("_astro/", distDir);
const failures = [];

const routes = [
  { label: "Fuyukawa Home", htmlPath: "index.html", htmlLimit: 220_000, cssLimit: 320_000 },
  { label: "Fuyukawa Blog", htmlPath: "blog/index.html", htmlLimit: 200_000, cssLimit: 320_000 },
  { label: "Fuyukawa Games", htmlPath: "games/index.html", htmlLimit: 200_000, cssLimit: 320_000 },
  { label: "Fuyukawa Projects", htmlPath: "projects/index.html", htmlLimit: 220_000, cssLimit: 320_000 },
  { label: "Fuyukawa About", htmlPath: "about/index.html", htmlLimit: 220_000, cssLimit: 320_000 }
];

const formatBytes = (value) => `${(value / 1024).toFixed(1)} KiB`;

const recordBudget = (label, size, limit) => {
  const passed = size <= limit;
  console.log(`${passed ? "PASS" : "FAIL"} ${label}: ${formatBytes(size)} / ${formatBytes(limit)}`);
  if (!passed) failures.push(`${label} exceeded its budget by ${formatBytes(size - limit)}`);
};

let astroFiles = [];
try {
  astroFiles = await readdir(astroDir);
} catch {
  failures.push("dist/_astro is missing");
}

for (const route of routes) {
  try {
    const html = await readFile(new URL(route.htmlPath, distDir), "utf8");
    recordBudget(`${route.label} HTML`, Buffer.byteLength(html), route.htmlLimit);

    const stylesheetPaths = [...html.matchAll(/href="\/_astro\/([^"?]+\.css)(?:\?[^\"]*)?"/g)]
      .map((match) => match[1]);
    const uniquePaths = [...new Set(stylesheetPaths)];
    const sizes = await Promise.all(
      uniquePaths.map((name) => stat(new URL(name, astroDir)).then((details) => details.size))
    );
    recordBudget(
      `${route.label} CSS`,
      sizes.reduce((total, size) => total + size, 0),
      route.cssLimit
    );
  } catch (error) {
    failures.push(`${route.label} could not be measured: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error("\nPerformance budget violations:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("\nAll performance budgets passed.");
}
