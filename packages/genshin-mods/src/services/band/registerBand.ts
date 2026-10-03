import type { EngineInterface, On, RenderElement, RenderInput } from "claude-code";

import { atom, read, update } from "claude-code";

import { ACCENT_COLOR, HANDOFF_QUESTION, MAX_SHOWN_TASKS, WARM_QUESTION } from "../constants";
import { InitialState } from "../InitialState";
import { getResinFigures } from "../resin/getResinFigures";
import { getCommissionSummary } from "./getCommissionSummary";

// The plugin's one band, a row per mod with something to say. `$` is followed only into functions in the file that
// Hooked it, so each row and each button's action lives here beside the hook
const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const isCommissionExpandedAtom = atom(
  { key: "isCommissionExpanded", plugin: "genshin-mods" } as const,
  InitialState.isCommissionExpanded,
);
const isHandingOffAtom = atom({ key: "isHandingOff", plugin: "genshin-mods" } as const, InitialState.isHandingOff);
const lastResponseAtAtom = atom(
  { key: "lastResponseAt", plugin: "genshin-mods" } as const,
  InitialState.lastResponseAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);

// The engine's press slot takes no promise; every action here resolves each of its outcomes itself
const press = (action: () => Promise<unknown>) => () => {
  // oxlint-disable-next-line typescript/no-floating-promises -- The press slot is the engine's and returns nothing
  action();
};

const StatusMarkMap = { completed: "✓", in_progress: "▸", pending: "·" } as const;

// A fork re-sends the conversation's prefix, which renews the cache, and adds no row to the transcript
const warmCache = async ($: EngineInterface) => {
  const answer = await $.model.fork({ prompt: WARM_QUESTION });
  if (!answer.isAnswered) {
    $.ui.toast(`The cache was not warmed: ${answer.reason}.`);
    return;
  }

  const now = await $.clock.now();
  await update($, lastResponseAtAtom, () => now);
  await update($, nowAtom, () => now);
};

// The whole relay in one press: the clear waits for the handoff text, so a fork that fails clears nothing
const handOff = async ($: EngineInterface) => {
  await update($, isHandingOffAtom, () => true);
  const answer = await $.model.fork({ prompt: HANDOFF_QUESTION });
  if (answer.isAnswered && answer.text.trim()) {
    await $.command.run({ command: "clear" });
    await $.prompt.submit({ text: answer.text });
  } else $.ui.toast(`The handoff was not written: ${answer.isAnswered ? "it came back empty" : answer.reason}.`);
  await update($, isHandingOffAtom, () => false);
};

const drawResinRow = async ($: EngineInterface, e: RenderInput<"AbovePrompt">): Promise<RenderElement | undefined> => {
  const lastResponseAt = await read($, lastResponseAtAtom);
  if (lastResponseAt === 0 || !(await read($, enabledModsAtom)).resin) return undefined;

  const figures = getResinFigures(await $.session.usage(), lastResponseAt, await read($, nowAtom));
  const isHandingOff = await read($, isHandingOffAtom);
  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Text({ bold: true, children: "Resin  ", color: ACCENT_COLOR }),
      ...figures.map(({ isWarning, label, text }) =>
        Text({ children: `${label} ${text}  `, color: isWarning ? "yellow" : undefined, dimColor: !isWarning }),
      ),
      isHandingOff
        ? Text({ children: "writing the handoff…", dimColor: true })
        : Box({
            children: [
              Button({ key: "resin-warm", label: "Warm", onPress: press(() => warmCache($)) }),
              Button({ key: "resin-compact", label: "Compact", onPress: press(() => $.session.compact()) }),
              Button({ key: "resin-handoff", label: "Handoff", onPress: press(() => handOff($)), variant: "primary" }),
            ],
            flexDirection: "row",
          }),
    ],
    flexDirection: "row",
    flexWrap: "wrap",
  });
};

const drawCommissionRow = async (
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
): Promise<RenderElement | undefined> => {
  const commission = await read($, commissionAtom);
  if (commission.tasks.length === 0 || !(await read($, enabledModsAtom)).commission) return undefined;

  const isExpanded = await read($, isCommissionExpandedAtom);
  const shownTasks = isExpanded
    ? commission.tasks.slice(0, MAX_SHOWN_TASKS)
    : commission.tasks.filter(({ status }) => status === "in_progress");
  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Box({
        children: [
          Text({ bold: true, children: "Commission  ", color: ACCENT_COLOR }),
          Text({ children: `${getCommissionSummary(commission, await read($, nowAtom))}  `, wrap: "truncate-end" }),
          Button({
            hotkey: "g",
            key: "commission-expand",
            label: isExpanded ? "Fewer" : "All tasks",
            onPress: press(() => update($, isCommissionExpandedAtom, (value) => !value)),
            plain: true,
          }),
        ],
        flexDirection: "row",
      }),
      ...shownTasks.map(({ status, subject }) =>
        Text({
          children: `  ${StatusMarkMap[status]} ${subject}`,
          dimColor: status !== "in_progress",
          wrap: "truncate-end",
        }),
      ),
    ],
    flexDirection: "column",
  });
};

const drawWaypointsRow = async (
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
): Promise<RenderElement | undefined> => {
  const waypoints = await read($, waypointsAtom);
  if (waypoints.length === 0 || e.props.isWorking || !(await read($, enabledModsAtom)).waypoints) return undefined;

  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Text({ bold: true, children: "Waypoints", color: ACCENT_COLOR }),
      ...waypoints.map((waypoint, index) =>
        Button({
          hotkey: `${index + 1}`,
          key: `waypoint-${index}`,
          label: waypoint,
          onPress: press(() => $.prompt.submit({ text: waypoint })),
          plain: true,
        }),
      ),
      Button({
        key: "waypoints-dismiss",
        label: "Dismiss",
        onPress: press(() => update($, waypointsAtom, () => InitialState.waypoints)),
        plain: true,
        role: "dismiss",
      }),
    ],
    flexDirection: "column",
  });
};

// The veil's marker first, so a recording never runs with it off unnoticed, and the engine's own band whenever no
// Mod has anything to say
export const registerBand = (on: On): void => {
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e);

    const rows = (await Promise.all([drawResinRow($, e), drawCommissionRow($, e), drawWaypointsRow($, e)])).filter(
      (row) => row !== undefined,
    );
    const isVeiled = (await read($, enabledModsAtom)).veil;
    if (rows.length === 0 && !isVeiled) return next(e);

    const { Box, Text } = $.ui.resolve(e);
    const marker = isVeiled
      ? [Text({ bold: true, children: "● Veil on: values are hidden on screen", color: "red" })]
      : [];
    return Box({ children: [...marker, ...rows], flexDirection: "column" });
  });
};
