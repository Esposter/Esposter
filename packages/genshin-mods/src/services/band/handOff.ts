import type { EngineInterface } from "claude-code";

import { atom, update } from "claude-code";

import { InitialState } from "../InitialState";
import { relay } from "./relay";

const isHandingOffAtom = atom({ key: "isHandingOff", plugin: "genshin-mods" } as const, InitialState.isHandingOff);
// The relay is settled rather than awaited, so a clear or submit that rejects still brings the buttons back
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function handOff($: EngineInterface): Promise<void> {
  await update($, isHandingOffAtom, () => true);
  const [outcome] = await Promise.allSettled([relay($)]);
  await update($, isHandingOffAtom, () => false);
  if (outcome.status === "rejected") $.ui.toast(`The handoff failed: ${String(outcome.reason)}.`);
}
