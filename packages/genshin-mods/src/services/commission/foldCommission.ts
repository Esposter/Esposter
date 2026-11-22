import type { EngineInterface } from "claude-code";

import { atom, read, update } from "claude-code";

import type { TaskCall } from "../../models/TaskCall";

import { InitialState } from "../InitialState";
import { foldTaskCall } from "./foldTaskCall";

// The engine traces a state reference only to an atom made in its own file, so a file declares the atoms it reads.
// These copies of another file's atoms are required, and the duplicate-code gate skips them
// `jscpd:ignore-start`
const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const lastPromptAtom = atom({ key: "lastPrompt", plugin: "genshin-mods" } as const, InitialState.lastPrompt);
// `jscpd:ignore-end`
// A task tool's call folded in, opening the commission on its first task with the goal read off the prompt that started
// The turn
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function foldCommission($: EngineInterface, call: TaskCall): Promise<void> {
  if (!(await read($, enabledModsAtom)).commission) return;
  const now = await $.clock.now();
  const lastPrompt = await read($, lastPromptAtom);
  await update($, commissionAtom, (commission) => ({
    goal: commission.goal || (lastPrompt.split("\n").find(Boolean) ?? "").trim(),
    openedAt: commission.openedAt || now,
    tasks: foldTaskCall(commission.tasks, call),
  }));
}
