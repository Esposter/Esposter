import type { EngineInterface } from "claude-code";

import { atom, read } from "claude-code";

import type { SinStatus } from "../../../types";

import { SinStatusKind } from "../../models/SinStatusKind";
import { InitialState } from "../InitialState";
import { readTypeSafeKey } from "./readTypeSafeKey";

const sinStatusAtom = atom({ key: "sinStatus", plugin: "genshin-mods" } as const, InitialState.sinStatus);
// The status as the band and the pane draw it: a key removed since the last prompt is said so at each draw.
// Before the next prompt would say it, and the stored status stands otherwise
// A declaration, not an arrow: the hooks module's
// oxlint-disable-next-line func-style -- bundle follows an imported helper that takes `$` into a function declaration
export async function readSinStatus($: EngineInterface, typeSafeKey: string): Promise<SinStatus> {
  if (!(await readTypeSafeKey($, typeSafeKey))) return SinStatusKind.NoKey;

  return read($, sinStatusAtom);
}
