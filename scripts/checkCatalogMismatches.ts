import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const workspaceYaml = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");
// Parse catalog from pnpm-workspace.yaml
const catalogSection = workspaceYaml.match(/^catalog:\n([\s\S]*?)(?=^\S|\Z)/m)?.[1] ?? "";
const catalogEntries = new Map<string, string>();
for (const match of catalogSection.matchAll(/^  ['"]?([^'":\n]+)['"]?:\s*(.+)$/gm))
  catalogEntries.set(match[1].trim(), match[2].trim());
// Parse catalog resolved versions from pnpm-lock.yaml
const lockCatalogsStart = lockYaml.indexOf("\ncatalogs:");
const lockCatalogsEnd = (() => {
  let end = lockYaml.length;
  for (const section of ["\npackages:", "\nsnapshots:", "\nimporters:"]) {
    const idx = lockYaml.indexOf(section, lockCatalogsStart + 1);
    if (idx !== -1 && idx < end) end = idx;
  }
  return end;
})();

const lockCatalogsText = lockYaml.slice(lockCatalogsStart, lockCatalogsEnd);
const resolvedVersions = new Map<string, string>();
for (const match of lockCatalogsText.matchAll(
  /    ['"]?([^'":\n]+)['"]?:\s*\n      specifier: [^\n]+\n      version: ([^\n]+)/g,
)) {
  const pkg = match[1].trim();
  // Strip peer dep suffix e.g. "1.2.3(peer@1.0.0)" -> "1.2.3"
  const version = match[2].trim().split(/[(@]/)[0].trim();
  resolvedVersions.set(pkg, version);
}
// Compare
const mismatches: { pkg: string; catalog: string; resolved: string }[] = [];
for (const [pkg, specifier] of catalogEntries) {
  const resolved = resolvedVersions.get(pkg);
  if (!resolved) continue;
  const specBase = specifier.replace(/^[\^~>=< ]+/, "");
  if (specBase !== resolved) mismatches.push({ pkg, catalog: specifier, resolved });
}

if (mismatches.length === 0) {
  console.log("All catalog entries match their resolved versions.");
  process.exit(0);
}

const pkgWidth = Math.max(...mismatches.map((m) => m.pkg.length), 7);
const specWidth = Math.max(...mismatches.map((m) => m.catalog.length), 7);
console.log(`${"Package".padEnd(pkgWidth)}  ${"Catalog".padEnd(specWidth)}  Resolved`);
console.log("-".repeat(pkgWidth + specWidth + 12));
for (const { pkg, catalog, resolved } of mismatches)
  console.log(`${pkg.padEnd(pkgWidth)}  ${catalog.padEnd(specWidth)}  ${resolved}`);

console.log(`\n${mismatches.length} mismatch(es) found.`);
process.exit(1);
