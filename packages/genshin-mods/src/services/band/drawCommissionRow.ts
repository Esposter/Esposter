import type { EngineInterface, RenderElement, RenderInput } from "claude-code";

import { atom, read, update } from "claude-code";

import type { EnabledMods } from "../../../types";

import { TaskStatus } from "../../models/TaskStatus";
import { MAX_SHOWN_TASKS } from "../constants";
import { InitialState } from "../InitialState";
import { getCommissionSummary } from "./getCommissionSummary";
import { press } from "./press";

const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const isCommissionExpandedAtom = atom(
  { key: "isCommissionExpanded", plugin: "genshin-mods" } as const,
  InitialState.isCommissionExpanded,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const StatusMarkMap = { [TaskStatus.Completed]: "✓", [TaskStatus.InProgress]: "▸", [TaskStatus.Pending]: "·" } as const;
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function drawCommissionRow(
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> {
  const commission = await read($, commissionAtom);
  if (commission.tasks.length === 0 || !enabledMods.commission) return undefined;

  const isExpanded = await read($, isCommissionExpandedAtom);
  const shownTasks = isExpanded
    ? commission.tasks.slice(0, MAX_SHOWN_TASKS)
    : commission.tasks.filter(({ status }) => status === TaskStatus.InProgress);
  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Box({
        children: [
          Text({ bold: true, children: "Commission  ", color: accent }),
          Text({ children: `${getCommissionSummary(commission, await read($, nowAtom))}  `, wrap: "truncate-end" }),
          Button({
            hotkey: "g",
            key: "commission-expand",
            label: isExpanded ? "Fewer" : "All tasks",
            onPress: press($, () => update($, isCommissionExpandedAtom, (value) => !value)),
            plain: true,
          }),
        ],
        flexDirection: "row",
      }),
      ...shownTasks.map(({ status, subject }) =>
        Text({
          children: `  ${StatusMarkMap[status]} ${subject}`,
          dimColor: status !== TaskStatus.InProgress,
          wrap: "truncate-end",
        }),
      ),
    ],
    flexDirection: "column",
  });
}
