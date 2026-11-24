import type { EngineInterface, RenderElement, RenderInput } from "claude-code";

import { atom, read, update } from "claude-code";

import type { EnabledMods } from "../../../types";

import { InitialState } from "../InitialState";
import { press } from "./press";

const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);
/* oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported
   helper that takes `$` only into a function declaration */
export async function drawWaypointsRow(
  $: EngineInterface,
  e: RenderInput<"AbovePrompt">,
  enabledMods: EnabledMods,
  accent: string,
): Promise<RenderElement | undefined> {
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
          onPress: press($, () => $.prompt.submit({ text: waypoint })),
          plain: true,
        }),
      ),
      Button({
        key: "waypoints-dismiss",
        label: "Dismiss",
        onPress: press($, () => update($, waypointsAtom, () => InitialState.waypoints)),
        plain: true,
        role: "dismiss",
      }),
    ],
    flexDirection: "column",
  });
}
