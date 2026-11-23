import type { EngineInterface, RenderElement, RenderInput } from "claude-code";

import { atom, read } from "claude-code";

import type { EnabledMods } from "../../../types";

import { InitialState } from "../InitialState";
import { getResinFigures } from "../resin/getResinFigures";
import { handOff } from "./handOff";
import { press } from "./press";
import { warmCache } from "./warmCache";

const isHandingOffAtom = atom({ key: "isHandingOff", plugin: "genshin-mods" } as const, InitialState.isHandingOff);
// The engine traces a state reference only to an atom made in its own file, so a file declares the atoms it reads.
// These copies of another file's atoms are required, and the duplicate-code gate skips them
// `jscpd:ignore-start`
const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
// `jscpd:ignore-end`
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function drawResinRow(
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> {
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
              Button({ hotkey: "w", key: "resin-warm", label: "Warm", onPress: press($, () => warmCache($)) }),
              Button({
                hotkey: "c",
                key: "resin-compact",
                label: "Compact",
                onPress: press($, () => $.session.compact()),
              }),
              Button({
                hotkey: "h",
                key: "resin-handoff",
                label: "Handoff",
                onPress: press($, () => handOff($)),
                variant: "primary",
              }),
            ],
            flexDirection: "row",
          }),
    ],
    flexDirection: "row",
    flexWrap: "wrap",
  });
}
