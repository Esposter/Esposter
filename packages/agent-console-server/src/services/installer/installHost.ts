import {
  CLAUDE_CODE_EXECUTABLE_FILENAME,
  HOST_EXECUTABLE_FILENAME,
  HOST_SCHEME_REGISTRY_KEY,
} from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { SITE_NAME } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, win32 } from "node:path";
import { getRawAsset } from "node:sea";

// Copies the executable into the user's local app data, writes out the Claude Code binary it carries inside it, and
// Registers the link scheme in the user's own registry classes — one downloaded file, and no administrator asked
export const installHost = (): string => {
  const installDirectory = getHostInstallDirectory();
  const executablePath = join(installDirectory, HOST_EXECUTABLE_FILENAME);
  mkdirSync(installDirectory, { recursive: true });
  copyFileSync(process.execPath, executablePath);
  writeFileSync(
    join(installDirectory, CLAUDE_CODE_EXECUTABLE_FILENAME),
    new Uint8Array(getRawAsset(CLAUDE_CODE_EXECUTABLE_FILENAME)),
  );
  for (const registryArguments of [
    [HOST_SCHEME_REGISTRY_KEY, "/ve", "/d", `URL:${SITE_NAME} Host`],
    [HOST_SCHEME_REGISTRY_KEY, "/v", "URL Protocol", "/d", ""],
    [win32.join(HOST_SCHEME_REGISTRY_KEY, "shell", "open", "command"), "/ve", "/d", `"${executablePath}" "%1"`],
  ])
    execFileSync("reg", ["add", ...registryArguments, "/f"], { stdio: "ignore" });
  return installDirectory;
};
