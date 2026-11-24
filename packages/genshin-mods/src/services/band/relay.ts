import type { EngineInterface } from "claude-code";

import { HANDOFF_QUESTION } from "../constants";

// The whole relay in one press: the clear waits for the handoff text, so a fork that fails clears nothing
/* oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported
   helper that takes `$` only into a function declaration */
export async function relay($: EngineInterface): Promise<void> {
  const answer = await $.model.fork({ prompt: HANDOFF_QUESTION });
  if (answer.isAnswered && answer.text.trim()) {
    await $.command.run({ command: "clear" });
    await $.prompt.submit({ text: answer.text });
  } else $.ui.toast(`The handoff was not written: ${answer.isAnswered ? "it came back empty" : answer.reason}.`);
}
