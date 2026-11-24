import { getRepository } from "#src/services/getRepository";
import { getSessionContext } from "#src/services/getSessionContext";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { spawnSync } from "node:child_process";

// The session id, the repository, the time zone and the configured list, put into the session's context.
// A tool call cannot see which session made it, but every hook's input names the session.
// A session start is never blocked, since anything missing or unreadable adds nothing.
registerQuietExit();
let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;
const listId = process.env.CLAUDE_PLUGIN_OPTION_LIST_ID ?? "";
// The hook input is the tool's to shape.
// oxlint-disable-next-line no-restricted-properties -- each field read is checked for its type
const hookInput: unknown = input.trim() ? JSON.parse(input) : {};
const checkIsRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const { cwd, session_id: sessionId }: Record<string, unknown> = checkIsRecord(hookInput) ? hookInput : {};
if (listId && typeof sessionId === "string" && typeof cwd === "string") {
  const { stdout } = spawnSync("git", ["remote", "get-url", "origin"], { cwd, encoding: "utf8", windowsHide: true });
  // A git that cannot be spawned leaves stdout null, which the string type does not show, so it reads as no remote
  const additionalContext = getSessionContext({
    listId,
    repository: getRepository(stdout ?? ""),
    sessionId,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  console.log(JSON.stringify({ hookSpecificOutput: { additionalContext, hookEventName: "SessionStart" } }));
}
