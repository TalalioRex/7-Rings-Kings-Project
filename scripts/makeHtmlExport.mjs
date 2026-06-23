import { copyFile, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const exportDir = path.join(process.cwd(), "out");
const launcherFileName = "Open 7 Rings Prototype.html";
const textExtensions = new Set([".html", ".txt", ".css", ".js"]);

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function makeRootPathsRelative(content) {
  return content
    .replace(/(^|[^.])\/_next/g, "$1./_next")
    .replace(/(^|[^.])\/assets/g, "$1./assets");
}

async function verifyLauncherReferences(launcherPath) {
  const launcherDir = path.dirname(launcherPath);
  const html = await readFile(launcherPath, "utf8");
  const refs = html.matchAll(/(?:src|href|poster)="(\.\/[^"#?]+)"|url\((\.\/[^)#?]+)\)/g);
  const missing = [];

  for (const match of refs) {
    const ref = match[1] ?? match[2];
    const targetPath = path.join(launcherDir, ref.slice(2).replaceAll("/", path.sep));

    try {
      await stat(targetPath);
    } catch {
      missing.push(ref);
    }
  }

  if (missing.length > 0) {
    throw new Error(`HTML export is missing referenced files:\n${[...new Set(missing)].join("\n")}`);
  }
}

const files = await collectFiles(exportDir);

await Promise.all(
  files
    .filter((file) => textExtensions.has(path.extname(file)))
    .map(async (file) => {
      const content = await readFile(file, "utf8");
      await writeFile(file, makeRootPathsRelative(content));
    })
);

const indexPath = path.join(exportDir, "index.html");
const launcherPath = path.join(exportDir, launcherFileName);

await copyFile(indexPath, launcherPath);
await verifyLauncherReferences(launcherPath);

console.log(`HTML launcher ready: ${path.relative(process.cwd(), launcherPath)}`);
