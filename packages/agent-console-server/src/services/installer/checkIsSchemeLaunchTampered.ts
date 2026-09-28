import { HOST_SCHEME } from "#src/services/installer/constants";

// Windows starts the host from a link as `"agent-console-host.exe" "%1"`, so a genuine link arrives as the one
// Argument. Any site can open a link, and one carrying a quote closes that argument early and smuggles in flags of its
// Own — `--origin` pointing the printed link, and the token in it, at the attacker's site, or `--hostname 0.0.0.0` —
// So a launch that holds a link and anything else was tampered with, and is refused
export const checkIsSchemeLaunchTampered = (commandLineArguments: string[]): boolean =>
  commandLineArguments.length > 1 &&
  commandLineArguments.some((commandLineArgument) => commandLineArgument.startsWith(`${HOST_SCHEME}:`));
