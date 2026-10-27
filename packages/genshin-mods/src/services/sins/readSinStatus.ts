import type { EngineInterface } from "claude-code";

import { atom, read } from "claude-code";

import type { SinStatus } from "../../../types";

import { InitialState } from "../InitialState";

const sinStatusAtom = atom({ key: "sinStatus", plugin: "genshin-mods" } as const, InitialState.sinStatus);

// The status as the band and the pane draw it: a key removed since the last prompt is said so at each draw, before the next
// Prompt would say it, and the stored status stands otherwise
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function readSinStatus($: EngineInterface): Promise<SinStatus> {
  if (!(await $.env.get("TYPESAFE_API_KEY"))) return "no-key";

  return read($, sinStatusAtom);
}
