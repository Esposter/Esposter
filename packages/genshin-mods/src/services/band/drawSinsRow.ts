import type { EngineInterface, RenderElement, RenderInput } from "claude-code";

import { atom, read } from "claude-code";

import type { EnabledMods } from "../../../types";

import { InitialState } from "../InitialState";
import { SINS_PANE_ID } from "../sins/constants";
import { getSinScores } from "../sins/getSinScores";
import { readIsLightTheme } from "../sins/readIsLightTheme";
import { readSinStatus } from "../sins/readSinStatus";
import { SinColorMap } from "../sins/SinColorMap";
import { SinStatusTextMap } from "../sins/SinStatusTextMap";
import { press } from "./press";

const sinHistoryAtom = atom({ key: "sinHistory", plugin: "genshin-mods" } as const, InitialState.sinHistory);
// The sins as one line, each in its colour, with the pane's own button; the pane holds the bars and the trends
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function drawSinsRow(
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
  enabledMods: EnabledMods,
  accent: string,
  typeSafeKey: string,
): Promise<RenderElement | undefined> {
  if (!enabledMods.sins) return undefined;

  const scores = getSinScores(await read($, sinHistoryAtom));
  const isLight = await readIsLightTheme($);
  const summary = SinStatusTextMap[await readSinStatus($, typeSafeKey)];
  const { Box, Button, Text } = $.ui.resolve(e);
  return Box({
    children: [
      Text({ bold: true, children: "Sins  ", color: accent }),
      ...(summary ? [Text({ children: `${summary}  `, dimColor: true })] : []),
      ...(scores.length === 0 && !summary ? [Text({ children: "no prompt scored yet  ", dimColor: true })] : []),
      ...scores.map(({ name, score }) =>
        Text({
          children: `${name} ${Math.round(score * 100)}%  `,
          color: SinColorMap[name][isLight ? "light" : "dark"],
        }),
      ),
      Button({
        hotkey: "p",
        key: "sins-panel",
        label: "Panel",
        onPress: press($, () => $.ui.open({ id: SINS_PANE_ID, title: "Seven sins" })),
        plain: true,
      }),
    ],
    flexDirection: "row",
    flexWrap: "wrap",
  });
}
