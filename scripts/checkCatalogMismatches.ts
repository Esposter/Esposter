import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const workspaceYaml = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");
// Parse catalog from pnpm-workspace.yaml
const catalogSection = /^catalog:\n(?<section>[\s\S]*?)(?=^\S|(?![\s\S]))/mu.exec(workspaceYaml)?.groups?.section ?? "";
const catalogEntries = new Map<string, string>();
for (const { groups } of catalogSection.matchAll(/^[ ]{2}['"]?(?<pkg>[^'":\n]+)['"]?:\s*(?<spec>.+)$/gmu)) {
  const pkg = groups?.pkg;
  const spec = groups?.spec;
  if (!pkg || !spec) continue;
  catalogEntries.set(pkg.trim(), spec.trim());
}
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
for (const { groups } of lockCatalogsText.matchAll(
  /[ ]{4}['"]?(?<pkg>[^'":\n]+)['"]?:\s*\n[ ]{6}specifier: [^\n]+\n[ ]{6}version: (?<version>[^\n]+)/gu,
)) {
  const pkg = groups?.pkg;
  const version = groups?.version;
  if (!pkg || !version) continue;
  // Strip peer dep suffix e.g. "1.2.3(peer@1.0.0)" -> "1.2.3"
  resolvedVersions.set(pkg.trim(), version.trim().split(/[(@]/u)[0]?.trim() ?? "");
}
// Compare
const mismatches: { catalog: string; pkg: string; resolved: string }[] = [];
for (const [pkg, specifier] of catalogEntries) {
  const resolved = resolvedVersions.get(pkg);
  if (!resolved) continue;
  const specBase = specifier.replace(/^[\^~>=< ]+/u, "");
  if (specBase !== resolved) mismatches.push({ catalog: specifier, pkg, resolved });
}

if (mismatches.length === 0) {
  console.log("All catalog entries match their resolved versions.");
  process.exit(0);
}

const pkgWidth = Math.max(...mismatches.map((m) => m.pkg.length), 7);
const specWidth = Math.max(...mismatches.map((m) => m.catalog.length), 7);
console.log(`${"Package".padEnd(pkgWidth)}  ${"Catalog".padEnd(specWidth)}  Resolved`);
console.log("-".repeat(pkgWidth + specWidth + 12));
for (const { catalog, pkg, resolved } of mismatches)
  console.log(`${pkg.padEnd(pkgWidth)}  ${catalog.padEnd(specWidth)}  ${resolved}`);

console.log(`\n${mismatches.length} mismatch(es) found.`);
process.exit(1);
