import { getLatestVersion } from "@/services/getLatestVersion";
import { getRegistryLatestVersionForPrefix } from "@/services/getRegistryLatestVersionForPrefix";
import { getVersionParts } from "@/services/getVersionParts";
import { getEnginesNode } from "@/updateNode/getEnginesNode";
import { setCatalogTypesNode } from "@/updateNode/setCatalogTypesNode";
import { setEnginesNode } from "@/updateNode/setEnginesNode";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
// 1. Resolve target node version to a full published release (strip a leading `v`/`^`); a partial
// Request like `X` / `X.Y` resolves to its highest release (`X.Y.Z`) so package.json pins a real
// Version. Default to the latest stable from npm.
const requested = process.argv[2]?.replace(/^[v^]/u, "");
const version =
  requested === undefined ? await getLatestVersion("node") : await getRegistryLatestVersionForPrefix("node", requested);
const { major } = getVersionParts(version);
// 2. Bump engines.node (CI reads this via `node-version-file: package.json` — single source of truth).
const packageJsonPath = resolve(root, "package.json");
const packageJson = readFileSync(packageJsonPath, "utf8");
const oldVersion = getEnginesNode(packageJson);
if (oldVersion === version) {
  console.info(`node is already ${version} — nothing to update.`);
  process.exit(0);
}
console.info(`Updating node ${oldVersion} → ${version}\n`);
writeFileSync(packageJsonPath, setEnginesNode(packageJson, version));
console.info(`✔ package.json engines.node → ^${version}`);
// 3. Bump the @types/node catalog entry to the highest release matching the new node major.
const typesVersion = await getRegistryLatestVersionForPrefix("@types/node", String(major));
const workspacePath = resolve(root, "pnpm-workspace.yaml");
writeFileSync(workspacePath, setCatalogTypesNode(readFileSync(workspacePath, "utf8"), typesVersion));
console.info(`✔ pnpm-workspace.yaml @types/node → ^${typesVersion}`);
// 4. Hand off install / switch / cleanup of the old version to the native (per-OS) script via crossOS.
console.info("\nInstalling and switching via fnm…");
const result = spawnSync(`pnpm crossOS update:node ${version} ${oldVersion}`, {
  cwd: root,
  shell: true,
  stdio: "inherit",
});
if (result.status !== 0) throw new Error("fnm install/switch failed");

console.info("\nDone. Run `pnpm refresh:lockfile` to resolve the new @types/node (other open shells need `fnm use`).");
