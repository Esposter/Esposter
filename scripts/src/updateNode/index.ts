import { PACKAGE_LOCK_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getVersionParts } from "#src/services/shared/getVersionParts";
import { readManifestFiles } from "#src/services/shared/readManifestFiles";
import { runCommand } from "#src/services/timing/runCommand";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { getEnvWithoutPackageBins } from "#src/services/updateNode/getEnvWithoutPackageBins";
import { readRegistryLatestVersionForPrefix } from "#src/services/updateNode/readRegistryLatestVersionForPrefix";
import { setCatalogTypesNode } from "#src/services/updateNode/setCatalogTypesNode";
import { setLockfileNodeVersion } from "#src/services/updateNode/setLockfileNodeVersion";
import { setManifestNodeVersion } from "#src/services/updateNode/setManifestNodeVersion";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { spawnSync } from "@esposter/shared-node/child-process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

// Runs the global `vp`, which resolves, pins and installs node, and cleans the versions nothing names any more
const runVp = (vpArgs: string[]): void => {
  const result = spawnSync("vp", vpArgs, {
    cwd: REPOSITORY_ROOT,
    env: getEnvWithoutPackageBins(process.env),
    stdio: "inherit",
  });
  if (result.status !== 0)
    throw new InvalidOperationError(
      Operation.Update,
      "update:node",
      `\`vp ${vpArgs.join(" ")}\` failed — install the global vp first (https://viteplus.dev/guide/)`,
    );
};

// Rewrite a file only when the edit changed it, and say which node floor it now carries
const updateNodeFloorFile = (path: string, version: string, setFloor: (text: string) => string): void => {
  const text = readFileSync(path, "utf8");
  const updatedText = setFloor(text);
  if (updatedText === text) return;

  writeFileSync(path, updatedText);
  console.info(`✔ ${relative(REPOSITORY_ROOT, path)} node → >=${version}`);
};

await runCommand(
  defineCommand({
    args: {
      // Whole or partial, with a leading v or ^ allowed; vp resolves it to the highest release it names
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
      const nodeVersionPath = resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME);
      const oldVersion = readFileSync(nodeVersionPath, "utf8").trim();
      // 1. Pin through vp, which resolves the request to a full release, writes `.node-version` and installs it.
      // With no request, `latest` is the Current line rather than LTS
      runVp(["env", "pin", args.version.replace(/^[v^]/u, "") || "latest", "--target", "node-version", "--force"]);
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
