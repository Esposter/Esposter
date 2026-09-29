import { getRepository } from "#src/services/getRepository";
import { getSessionContext } from "#src/services/getSessionContext";
import { spawnSync } from "node:child_process";

// The session id, the repository, the time zone and the configured list, put into the session's context: a tool call
// Cannot see which session made it, but every hook's input names the session. A session start is never blocked by
// This, so anything missing or unreadable adds nothing
let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;
const listId = process.env.CLAUDE_PLUGIN_OPTION_LIST_ID ?? "";
// oxlint-disable-next-line no-restricted-properties -- the hook input is the tool's to shape, and each field read is checked for its type
const hookInput: unknown = input.trim() ? JSON.parse(input) : {};
const { cwd, session_id: sessionId } = (typeof hookInput === "object" && hookInput ? hookInput : {}) as Record<
  string,
  unknown
>;
if (listId && typeof sessionId === "string" && typeof cwd === "string") {
  const { stdout } = spawnSync("git", ["remote", "get-url", "origin"], { cwd, encoding: "utf8" });
  const additionalContext = getSessionContext({
    listId,
    repository: getRepository(stdout ?? ""),
    sessionId,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  console.log(JSON.stringify({ hookSpecificOutput: { additionalContext, hookEventName: "SessionStart" } }));
}
