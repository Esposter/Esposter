import type { EngineInterface, On, RenderElement, RenderInput } from "claude-code";

import { atom, read, update } from "claude-code";

import type { EnabledMods } from "../../../types";

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
const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);

// The engine's press slot takes no promise; every action here resolves each of its outcomes itself
const press = (action: () => Promise<unknown>) => () => {
  // oxlint-disable-next-line typescript/no-floating-promises -- The press slot is the engine's and returns nothing
  action();
};

const StatusMarkMap = { completed: "✓", in_progress: "▸", pending: "·" } as const;

// A fork re-sends the conversation's prefix, which renews the cache from the moment it is sent, and adds no row to the
// Transcript
const warmCache = async ($: EngineInterface) => {
  const requestedAt = await $.clock.now();
  const answer = await $.model.fork({ prompt: WARM_QUESTION });
  if (!answer.isAnswered) {
    $.ui.toast(`The cache was not warmed: ${answer.reason}.`);
    return;
  }

  await update($, lastCacheRequestAtAtom, () => requestedAt);
  await update($, nowAtom, () => requestedAt);
};

// The whole relay in one press: the clear waits for the handoff text, so a fork that fails clears nothing
const relay = async ($: EngineInterface) => {
  const answer = await $.model.fork({ prompt: HANDOFF_QUESTION });
  if (answer.isAnswered && answer.text.trim()) {
    await $.command.run({ command: "clear" });
    await $.prompt.submit({ text: answer.text });
  } else $.ui.toast(`The handoff was not written: ${answer.isAnswered ? "it came back empty" : answer.reason}.`);
};

// The relay is settled rather than awaited, so a clear or submit that rejects still brings the buttons back
const handOff = async ($: EngineInterface) => {
  await update($, isHandingOffAtom, () => true);
  const [outcome] = await Promise.allSettled([relay($)]);
  await update($, isHandingOffAtom, () => false);
  if (outcome.status === "rejected") $.ui.toast(`The handoff failed: ${String(outcome.reason)}.`);
};

// The session character's colour, which the persona publishes, else the game's interface gold
const readAccent = async ($: EngineInterface) =>
  (await read($, { key: "character", plugin: "genshin-persona" } as const))?.color || ACCENT_COLOR;

const drawResinRow = async (
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> => {
  const lastCacheRequestAt = await read($, lastCacheRequestAtAtom);
  if (lastCacheRequestAt === 0 || !enabledMods.resin) return undefined;

  const figures = getResinFigures(await $.session.usage(), lastCacheRequestAt, await read($, nowAtom));
  const isHandingOff = await read($, isHandingOffAtom);
  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Text({ bold: true, children: "Resin  ", color: accent }),
      ...figures.map(({ isWarning, label, text }) =>
        Text({ children: `${label} ${text}  `, color: isWarning ? "yellow" : undefined, dimColor: !isWarning }),
      ),
      isHandingOff
        ? Text({ children: "writing the handoff…", dimColor: true })
        : Box({
            children: [
              Button({ hotkey: "w", key: "resin-warm", label: "Warm", onPress: press(() => warmCache($)) }),
              Button({
                hotkey: "c",
                key: "resin-compact",
                label: "Compact",
                onPress: press(() => $.session.compact()),
              }),
              Button({
                hotkey: "h",
                key: "resin-handoff",
                label: "Handoff",
                onPress: press(() => handOff($)),
                variant: "primary",
              }),
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
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> => {
  const commission = await read($, commissionAtom);
  if (commission.tasks.length === 0 || !enabledMods.commission) return undefined;

  const isExpanded = await read($, isCommissionExpandedAtom);
  const shownTasks = isExpanded
    ? commission.tasks.slice(0, MAX_SHOWN_TASKS)
    : commission.tasks.filter(({ status }) => status === "in_progress");
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
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> => {
  const waypoints = await read($, waypointsAtom);
  if (waypoints.length === 0 || e.props.isWorking || !enabledMods.waypoints) return undefined;

  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Text({ bold: true, children: "Waypoints", color: accent }),
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

    const enabledMods = await read($, enabledModsAtom);
    const accent = await readAccent($);
    const rows = (
      await Promise.all([
        drawResinRow($, e, enabledMods, accent),
        drawCommissionRow($, e, enabledMods, accent),
        drawWaypointsRow($, e, enabledMods, accent),
      ])
    ).filter((row) => row !== undefined);
    if (rows.length === 0 && !enabledMods.veil) return next(e);

    const { Box, Text } = $.ui.resolve(e);
    const marker = enabledMods.veil
      ? [Text({ bold: true, children: "● Veil on: values are hidden on screen", color: "red" })]
      : [];
    return Box({ children: [...marker, ...rows], flexDirection: "column" });
  });
};
