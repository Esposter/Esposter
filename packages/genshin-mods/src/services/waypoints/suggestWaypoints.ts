import type { EngineInterface } from "claude-code";

import { atom, update } from "claude-code";

import { WAYPOINTS_QUESTION } from "../constants";
import { InitialState } from "../InitialState";
import { parseWaypoints } from "./parseWaypoints";

const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function suggestWaypoints($: EngineInterface): Promise<void> {
  const answer = await $.model.fork({ prompt: WAYPOINTS_QUESTION });
  if (answer.isAnswered) await update($, waypointsAtom, () => parseWaypoints(answer.text));
}
