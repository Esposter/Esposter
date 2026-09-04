import { getLatestVersion } from "#scripts/services/getLatestVersion";
import { getVersionParts } from "#scripts/services/getVersionParts";
import { getEnginesNode } from "#scripts/updateNode/getEnginesNode";
import { getRegistryLatestVersionForPrefix } from "#scripts/updateNode/getRegistryLatestVersionForPrefix";
import { setCatalogTypesNode } from "#scripts/updateNode/setCatalogTypesNode";
import { setDevEnginesRuntime } from "#scripts/updateNode/setDevEnginesRuntime";
import { setEnginesNode } from "#scripts/updateNode/setEnginesNode";
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
// 2. Bump the two node pins package.json carries: `devEngines.runtime` is what `pnpm/setup` installs on the
// Runners, `engines.node` is what every other tool reads. They are the same number by definition, so they are
// Written together and never separately.
const packageJsonPath = resolve(root, "package.json");
const packageJson = readFileSync(packageJsonPath, "utf8");
const oldVersion = getEnginesNode(packageJson);
// The pins / @types/node only need rewriting when the target differs. We still hand off to fnm
// Below even when it matches: a colleague pulling this repo may have an older node defaulted in fnm (or
// Not have this version installed at all) and needs switching onto the pinned version.
const isNewVersion = oldVersion !== version;
if (isNewVersion) {
  console.info(`Updating node ${oldVersion} → ${version}\n`);
  writeFileSync(packageJsonPath, setDevEnginesRuntime(setEnginesNode(packageJson, version), version));
  console.info(`✔ package.json devEngines.runtime + engines.node → ^${version}`);
  // 3. Bump the @types/node catalog entry to the highest release matching the new node major.
  const typesVersion = await getRegistryLatestVersionForPrefix("@types/node", String(major));
  const workspacePath = resolve(root, "pnpm-workspace.yaml");
  writeFileSync(workspacePath, setCatalogTypesNode(readFileSync(workspacePath, "utf8"), typesVersion));
  console.info(`✔ pnpm-workspace.yaml @types/node → ^${typesVersion}`);
} else console.info(`node is already ${version} in package.json — ensuring fnm has it installed and defaulted.\n`);
// 4. Hand off install / default / cleanup of the old version to the native (per-OS) script via crossOS.
// When the version is unchanged, `old === new`, so the native script's guard skips the removal step.
console.info("Installing and defaulting via fnm…");
const result = spawnSync(`pnpm crossOS update:node ${version} ${oldVersion}`, {
  cwd: root,
  shell: true,
  stdio: "inherit",
});
if (result.status !== 0) throw new Error("fnm install/switch failed");

console.info(
  isNewVersion
    ? `\nDone. Run \`pnpm refresh:lockfile\` to resolve the new @types/node (new shells default to ${version}; already-open ones keep ${oldVersion} until reopened).`
    : `\nDone. New shells default to ${version}.`,
);
