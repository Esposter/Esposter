import { PACKAGE_LOCK_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getVersionParts } from "#src/services/shared/getVersionParts";
import { readManifestFiles } from "#src/services/shared/readManifestFiles";
import { runCommand } from "#src/services/timing/runCommand";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { readRegistryLatestVersionForPrefix } from "#src/services/updateNode/readRegistryLatestVersionForPrefix";
import { runVp } from "#src/services/updateNode/runVp";
import { setCatalogTypesNode } from "#src/services/updateNode/setCatalogTypesNode";
import { setLockfileNodeVersion } from "#src/services/updateNode/setLockfileNodeVersion";
import { setManifestNodeVersion } from "#src/services/updateNode/setManifestNodeVersion";
import { updateNodeFloorFile } from "#src/services/updateNode/updateNodeFloorFile";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { defineCommand } from "citty";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

await runCommand(
  defineCommand({
    args: {
      // Whole or partial, with a leading v or ^ allowed; vp resolves it to the highest release it names
      version: {
        default: "",
        description:
          "The node version to pin, whole or partial, a leading v or ^ allowed; the pin's own major when empty",
        required: false,
        type: "positional",
      },
    },
    meta: {
      description: "Pin node everywhere the repository names it, then install it through vp env",
      name: "update:node",
    },
    run: async ({ args }) => {
      const nodeVersionPath = resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME);
      const oldVersion = readFileSync(nodeVersionPath, "utf8").trim();
      // 1. Pin through vp, which resolves the request to a full release, writes `.node-version` and installs it.
      // With no request the pin's own major is re-resolved, so a major only ever moves when it is named
      const request = args.version.replace(/^[v^]/u, "") || String(getVersionParts(oldVersion).major);
      runVp(["env", "pin", request, "--target", "node-version", "--force"]);
      const version = readFileSync(nodeVersionPath, "utf8").trim();
      const isNewVersion = oldVersion !== version;
      // 2. Bump the @types/node catalog entry to the highest release matching the new node major
      if (isNewVersion) {
        const { major } = getVersionParts(version);
        const typesVersion = await readRegistryLatestVersionForPrefix("@types/node", String(major));
        const workspacePath = resolve(REPOSITORY_ROOT, WORKSPACE_FILE);
        const workspace = readFileSync(workspacePath, "utf8");
        writeFileSync(workspacePath, setCatalogTypesNode(workspace, typesVersion));
        console.info(`✔ ${WORKSPACE_FILE} @types/node → ^${typesVersion}`);
      }
      // 3. Move every manifest's node floor to the pin, and each npm lockfile's root entry beside one. It runs on an
      // Unchanged pin too, since Renovate's node branch moves the pin alone and a floor it left behind is caught up here
      for (const { path } of readManifestFiles(REPOSITORY_ROOT)) {
        updateNodeFloorFile(path, version, (text) => setManifestNodeVersion(text, version));
        const lockfilePath = resolve(dirname(path), PACKAGE_LOCK_JSON_FILENAME);
        if (existsSync(lockfilePath))
          updateNodeFloorFile(lockfilePath, version, (text) => setLockfileNodeVersion(text, version));
      }
      // 4. Remove the runtimes and package managers no pin or default names any more
      runVp(["env", "clean"]);

      console.info(
        isNewVersion
          ? `\nDone. Run \`pnpm refresh:lockfile\` to resolve the new @types/node.`
          : `\nDone. node ${version} is installed.`,
      );
    },
  }),
);
