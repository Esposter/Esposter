import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getVersionParts } from "#src/services/shared/getVersionParts";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { getLatestVersionForPrefix } from "#src/services/updateNode/getLatestVersionForPrefix";
import { readNodeVersions } from "#src/services/updateNode/readNodeVersions";
import { readRegistryLatestVersionForPrefix } from "#src/services/updateNode/readRegistryLatestVersionForPrefix";
import { setCatalogTypesNode } from "#src/services/updateNode/setCatalogTypesNode";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

await runMain(
  defineCommand({
    args: {
      // A partial request like `X` / `X.Y` resolves to its highest release (`X.Y.Z`) so the pin names a real version;
      // With none, the highest stable release nodejs.org publishes — the Current line, not LTS
      version: {
        default: "",
        description: "The node version to pin, whole or partial, a leading v or ^ allowed",
        required: false,
        type: "positional",
      },
    },
    meta: {
      description: "Pin node everywhere the repository names it, then install it through vp env",
      name: "update:node",
    },
    run: async ({ args }) => {
      // 1. Resolve target node version to a full published release (strip a leading `v`/`^`)
      const requested = args.version.replace(/^[v^]/u, "") || undefined;
      const nodeVersions = await readNodeVersions();
      const version = getLatestVersionForPrefix(nodeVersions, requested);
      const { major } = getVersionParts(version);
      // 2. Bump the one node pin, `.node-version`.
      const nodeVersionPath = resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME);
      const oldVersion = readFileSync(nodeVersionPath, "utf8").trim();
      // The pin and @types/node only need rewriting when the target differs. The install below still runs when it
      // Matches: a colleague pulling this repo may not have the pinned version installed yet.
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
      } else console.info(`node is already ${version} in ${NODE_VERSION_FILENAME} — ensuring it is installed.\n`);
      // 4. Hand the install to the global `vp`, which reads `.node-version` and `packageManager` itself and shims
      // Pnpm in place of Corepack; `clean` then removes the versions no pin or default names any more.
      for (const vpArgs of [
        ["env", "install"],
        ["env", "clean"],
      ]) {
        const result = spawnSync("vp", vpArgs, { cwd: REPOSITORY_ROOT, stdio: "inherit" });
        if (result.status !== 0)
          throw new InvalidOperationError(
            Operation.Update,
            "update:node",
            `\`vp ${vpArgs.join(" ")}\` failed — install the global vp first (https://viteplus.dev/guide/)`,
          );
      }

      console.info(
        isNewVersion
          ? `\nDone. Run \`pnpm refresh:lockfile\` to resolve the new @types/node.`
          : `\nDone. node ${version} is installed.`,
      );
    },
  }),
);
