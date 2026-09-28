// What a terminal runs to take a session over from the page: from the session's own folder, since a terminal finds a
// Session only under the folder it ran in, and only once that folder is entered, so a folder that has gone never
// Resumes the session somewhere else. A Windows folder is entered from PowerShell and any other from a POSIX shell,
// Each value single-quoted in that shell's own way, so a folder named like a command stays a name
const WINDOWS_PATH_REGEX = /^(?:[a-z]:|\\\\)/iu;
// PowerShell reads the typographic single quotes as quotes too
const POWERSHELL_QUOTE_REGEX = /['‘’‚‛]/gu;

const quotePosix = (value: string) => `'${value.replaceAll("'", String.raw`'\''`)}'`;

const quotePowerShell = (value: string) => `'${value.replaceAll(POWERSHELL_QUOTE_REGEX, "$&$&")}'`;

export const getResumeCommand = (cwd: string, sessionId: string): string =>
  WINDOWS_PATH_REGEX.test(cwd)
    ? `Set-Location -LiteralPath ${quotePowerShell(cwd)} -ErrorAction Stop; claude --resume ${quotePowerShell(sessionId)}`
    : `cd -- ${quotePosix(cwd)} && claude --resume ${quotePosix(sessionId)}`;
