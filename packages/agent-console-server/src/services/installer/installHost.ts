import {
  CLAUDE_CODE_EXECUTABLE_FILENAME,
  HOST_EXECUTABLE_FILENAME,
  HOST_SCHEME_REGISTRY_KEY,
} from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, win32 } from "node:path";

// Copies the executable and Claude Code beside it into the user's local app data and registers the link scheme in the
// User's own registry classes, so a page's Connect starts it with the browser's open-app prompt and no administrator
export const installHost = (): string => {
  const installDirectory = getHostInstallDirectory();
  const executablePath = join(installDirectory, HOST_EXECUTABLE_FILENAME);
  mkdirSync(installDirectory, { recursive: true });
  copyFileSync(process.execPath, executablePath);
  copyFileSync(
    join(dirname(process.execPath), CLAUDE_CODE_EXECUTABLE_FILENAME),
    join(installDirectory, CLAUDE_CODE_EXECUTABLE_FILENAME),
  );
  for (const registryArguments of [
    [HOST_SCHEME_REGISTRY_KEY, "/ve", "/d", "URL:Esposter Host"],
    [HOST_SCHEME_REGISTRY_KEY, "/v", "URL Protocol", "/d", ""],
    [win32.join(HOST_SCHEME_REGISTRY_KEY, "shell", "open", "command"), "/ve", "/d", `"${executablePath}" "%1"`],
  ])
    execFileSync("reg", ["add", ...registryArguments, "/f"], { stdio: "ignore" });
  return installDirectory;
};
