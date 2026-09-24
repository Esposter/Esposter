import { INSTALL_COMMAND } from "#src/services/coderabbit/collect/constants";

// What a session is told when the tree it was handed did not install (`runInstall`): every check it runs needs
// That install, so repairing it comes first, inside the commits the session's task already asks it for
export const getInstallFailureSection = (installFailure: string | undefined): string[] =>
  installFailure === undefined
    ? []
    : [
        "## The install failed",
        "",
        `\`pnpm ${INSTALL_COMMAND.join(" ")}\` failed on this tree before you started, so none of your checks can run yet. Repair that first, inside the commits the task above asks for — a stale lockfile is rebuilt with \`pnpm i\`, never edited by hand; a failing postinstall is fixed at the code it names — then rerun the install and carry on with the task above. Its output ended with:`,
        "",
        "```",
        installFailure,
        "```",
        "",
      ];
