import { PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getVersionParts } from "#src/services/shared/getVersionParts";
import { readLatestVersion } from "#src/services/shared/readLatestVersion";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { readRegistryLatestVersionForPrefix } from "#src/services/updateNode/readRegistryLatestVersionForPrefix";
import { setCatalogTypesNode } from "#src/services/updateNode/setCatalogTypesNode";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// 1. Resolve target node version to a full published release (strip a leading `v`/`^`); a partial
// Request like `X` / `X.Y` resolves to its highest release (`X.Y.Z`) so the pin names a real
// Version. Default to the latest stable from npm.
const requested = process.argv[2]?.replace(/^[v^]/u, "");
const version =
  requested === undefined
    ? await readLatestVersion("node")
    : await readRegistryLatestVersionForPrefix("node", requested);
const { major } = getVersionParts(version);
// 2. Bump the one node pin, `.node-version`.
const nodeVersionPath = resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME);
const oldVersion = readFileSync(nodeVersionPath, "utf8").trim();
// The pin and @types/node only need rewriting when the target differs. We still hand off to fnm
// Below even when it matches: a colleague pulling this repo may have an older node defaulted in fnm (or
// Not have this version installed at all) and needs switching onto the pinned version.
const isNewVersion = oldVersion !== version;
if (isNewVersion) {
  console.info(`Updating node ${oldVersion} → ${version}\n`);
  writeFileSync(nodeVersionPath, `${version}\n`);
  console.info(`✔ ${NODE_VERSION_FILENAME} → ${version}`);
  // 3. Bump the @types/node catalog entry to the highest release matching the new node major.
  const typesVersion = await readRegistryLatestVersionForPrefix("@types/node", String(major));
  const workspacePath = resolve(REPOSITORY_ROOT, WORKSPACE_FILE);
  const workspace = readFileSync(workspacePath, "utf8");
  const workspaceWithTypesNode = setCatalogTypesNode(workspace, typesVersion);
  writeFileSync(workspacePath, workspaceWithTypesNode);
  console.info(`✔ ${WORKSPACE_FILE} @types/node → ^${typesVersion}`);
} else
  console.info(
    `node is already ${version} in ${NODE_VERSION_FILENAME} — ensuring fnm has it installed and defaulted.\n`,
  );
// 4. Hand off install / default / cleanup of the old version to the native (per-OS) script via crossOS.
// When the version is unchanged, `old === new`, so the native script's guard skips the removal step.
console.info("Installing and defaulting via fnm…");
const result = spawnSync(PNPM_FILE, [...PNPM_ARGS, "crossOS", "update:node", version, oldVersion], {
  cwd: REPOSITORY_ROOT,
  stdio: "inherit",
});
if (result.status !== 0) throw new InvalidOperationError(Operation.Update, "update:node", "fnm install/switch failed");

console.info(
  isNewVersion
    ? `\nDone. Run \`pnpm refresh:lockfile\` to resolve the new @types/node (new shells default to ${version}; already-open ones keep ${oldVersion} until reopened).`
    : `\nDone. New shells default to ${version}.`,
);
