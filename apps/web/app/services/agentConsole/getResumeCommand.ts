import { WINDOWS_PATH_REGEX } from "@/services/agentConsole/constants";
import { quotePosix } from "@/services/agentConsole/quotePosix";
import { quotePowerShell } from "@/services/agentConsole/quotePowerShell";

// What a terminal runs to take a session over from the page: from the session's own folder, since a terminal finds a
// Session only under the folder it ran in, and only once that folder is entered, so a folder that has gone never
// Resumes the session somewhere else. A Windows folder is entered from PowerShell and any other from a POSIX shell,
// Each value single-quoted in that shell's own way, so a folder named like a command stays a name
// A line break in either value would end the command inside its quotes, so no command is given for one
export const getResumeCommand = (cwd: string, sessionId: string): string => {
  if (/[\r\n]/u.test(cwd) || /[\r\n]/u.test(sessionId)) return "";

  return WINDOWS_PATH_REGEX.test(cwd)
    ? `Set-Location -LiteralPath ${quotePowerShell(cwd)} -ErrorAction Stop; claude --resume ${quotePowerShell(sessionId)}`
    : `cd -- ${quotePosix(cwd)} && claude --resume ${quotePosix(sessionId)}`;
};
