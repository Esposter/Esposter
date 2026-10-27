import type { On } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { SIN_BAR_WIDTH, SINS_PANE_ID } from "./constants";
import { getBarCells } from "./getBarCells";
import { getSinScores } from "./getSinScores";
import { getTrendGlyphs } from "./getTrend";
import { readIsLightTheme } from "./readIsLightTheme";
import { readSinStatus } from "./readSinStatus";
import { SinColorMap } from "./SinColorMap";
import { SinStatusTextMap } from "./SinStatusTextMap";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const sinHistoryAtom = atom({ key: "sinHistory", plugin: "genshin-mods" } as const, InitialState.sinHistory);

// The seven sins in full: one bar per measured sin in the same order every time, its spread as the tinted tail, and its
// Last thirty prompts as a trend. It is drawn from the state alone, so a reload redraws it as it was, and it says so
// Rather than drawing stale bars once the switch is off
export const registerSins = (on: On, typeSafeKey: string): void => {
  on("ui.render", { component: "Pane", requestId: SINS_PANE_ID }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e);
    if (!(await read($, enabledModsAtom)).sins)
      return Box({
        children: [Text({ children: "Sins is off: turn it on with /sins on.", dimColor: true })],
        flexDirection: "column",
      });

    const scores = getSinScores(await read($, sinHistoryAtom));
    const isLight = await readIsLightTheme($);
    const statusText = SinStatusTextMap[await readSinStatus($, typeSafeKey)];
    return Box({
      children: [
        Text({ bold: true, children: "Seven sins" }),
        ...(scores.length === 0 ? [Text({ children: "No prompt scored yet.", dimColor: true })] : []),
        ...scores.map(({ name, score, spread, trend }) => {
          const color = SinColorMap[name][isLight ? "light" : "dark"];
          const { solid, tinted } = getBarCells({ score, spread }, SIN_BAR_WIDTH);
          const bar = "█".repeat(solid) + "▒".repeat(tinted) + " ".repeat(SIN_BAR_WIDTH - solid - tinted);
          return Box({
            children: [
              Text({ children: name.padEnd(9), color }),
              Text({ children: bar, color }),
              Text({ children: `${Math.round(score * 100)}% ±${Math.round(spread * 100)}`.padEnd(12) }),
              Text({ children: getTrendGlyphs(trend), color }),
            ],
            flexDirection: "row",
          });
        }),
        ...(statusText ? [Text({ children: statusText, dimColor: true })] : []),
      ],
      flexDirection: "column",
    });
  });
};
