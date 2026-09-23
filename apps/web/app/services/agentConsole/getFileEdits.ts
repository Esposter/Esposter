import type { FileEdit } from "@/models/agentConsole/FileEdit";
import type { ToolCall } from "@/models/agentConsole/ToolCall";

import { toFileEdits } from "@/services/agentConsole/toFileEdits";
// Every change the session's edit tools made, in the order they ran. A call that failed changed nothing and is left
// Out; one still waiting on its result is kept, since it is what the pending permission card is about
export const getFileEdits = (toolCalls: ToolCall[]): FileEdit[] =>
  toolCalls.flatMap(({ result, toolUse: { input, name, toolUseId } }) =>
    result?.isError ? [] : toFileEdits(name, input, toolUseId),
  );
