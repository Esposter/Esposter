import type { On } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { veilText } from "./veilText";
import { veilValue } from "./veilValue";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);

// Only the drawing changes: the transcript and what the model reads keep the real values. Each read subscribes the
// Row, so switching the veil redraws every row already on screen. The instruction the veil adds to the system prompt is
// An unmatched hook, so it is the lifecycle file's
export const registerVeil = (on: On): void => {
  on("ui.render", { component: "AssistantMessage" }, async ($, e, next) =>
    (await read($, enabledModsAtom)).veil
      ? next({ ...e, props: { ...e.props, text: veilText(e.props.text) } })
      : next(e),
  );

  on("ui.render", { component: "UserMessage" }, async ($, e, next) =>
    (await read($, enabledModsAtom)).veil
      ? next({ ...e, props: { ...e.props, text: veilText(e.props.text) } })
      : next(e),
  );

  on("ui.render", { component: "ToolResult" }, async ($, e, next) =>
    (await read($, enabledModsAtom)).veil
      ? next({ ...e, props: { ...e.props, output: veilValue(e.props.output) } })
      : next(e),
  );
};
