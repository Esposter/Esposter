import type { On } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { drawCommissionRow } from "./drawCommissionRow";
import { drawResinRow } from "./drawResinRow";
import { drawSinsRow } from "./drawSinsRow";
import { drawWaypointsRow } from "./drawWaypointsRow";
import { readAccent } from "./readAccent";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);

// The plugin's one band, a row per mod with something to say, each row drawn in its own file. The veil's marker first,
// So a recording never runs with it off unnoticed, and the engine's own band whenever no mod has anything to say
export const registerBand = (on: On, typeSafeKey: string): void => {
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e);

    const enabledMods = await read($, enabledModsAtom);
    const accent = await readAccent($);
    const rows = (
      await Promise.all([
        drawResinRow($, e, enabledMods, accent),
        drawCommissionRow($, e, enabledMods, accent),
        drawWaypointsRow($, e, enabledMods, accent),
        drawSinsRow($, e, enabledMods, accent, typeSafeKey),
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
