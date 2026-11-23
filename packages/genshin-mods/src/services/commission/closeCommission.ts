import type { EngineInterface } from "claude-code";

import { atom, update } from "claude-code";

import { InitialState } from "../InitialState";

const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const isCommissionExpandedAtom = atom(
  { key: "isCommissionExpanded", plugin: "genshin-mods" } as const,
  InitialState.isCommissionExpanded,
);
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function closeCommission($: EngineInterface): Promise<void> {
  await update($, commissionAtom, () => InitialState.commission);
  await update($, isCommissionExpandedAtom, () => InitialState.isCommissionExpanded);
}
