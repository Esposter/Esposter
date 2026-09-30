import { checkIsHostInstalled } from "#src/services/installer/checkIsHostInstalled";
import { installHost } from "#src/services/installer/installHost";
import { getResult } from "@esposter/shared";
import { isSea } from "node:sea";

// A download run from anywhere installs itself first, then serves from this window as the installed host would. An
// Install that cannot finish — most often an older host still running from the install folder, whose files Windows
// Keeps locked — says what to do rather than failing with a stack
export const installDownloadedHost = (): void => {
  if (!isSea() || checkIsHostInstalled()) return;
  getResult(() => installHost()).match(
    (installDirectory) => {
      process.stdout.write(`Installed the host in ${installDirectory}. The page's Connect starts it from now on.\n\n`);
    },
    (error) => {
      process.stderr.write(
        `Could not install the host: ${error.message}\nClose any other host window, then open this file again.\n`,
      );
      process.exit(1);
    },
  );
};
