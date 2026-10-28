import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { STYLE_BREAKPOINT_ORDER } from "#shared/services/pageBuilder/constants";
import { STYLE_BREAKPOINT_TITLE_MAP } from "@/services/pageBuilder/constants";

export interface StyleInheritance {
  // Where the value is set: a breakpoint's name, or the default state of the field's own breakpoint
  from: string;
  value: string;
}
// The value a field inherits when it sets none at its breakpoint and state: the nearest one the cascade applies there.
// A hover rule has a class and a pseudo-class, which outweighs every default rule whatever its breakpoint, so every
// Hover in the cascade comes before any default, and the defaults follow in the order their breakpoints win
export const getStyleInheritance = (
  style: NodeStyle,
  breakpoint: StyleBreakpoint,
  state: StyleState,
  property: StyleProperty,
): StyleInheritance | undefined => {
  const states = state === StyleState.Hover ? [StyleState.Hover, StyleState.Default] : [StyleState.Default];
  const cascade = STYLE_BREAKPOINT_ORDER.slice(0, STYLE_BREAKPOINT_ORDER.indexOf(breakpoint) + 1).toReversed();
  const sources = states.flatMap((sourceState) =>
    cascade.map((source) => ({ breakpoint: source, state: sourceState })),
  );
  const inherited = sources.find(
    (source) =>
      !(source.breakpoint === breakpoint && source.state === state) &&
      style[source.breakpoint]?.[source.state]?.[property] !== undefined,
  );
  if (!inherited) return undefined;

  const value = style[inherited.breakpoint]?.[inherited.state]?.[property] ?? "";
  const from = inherited.breakpoint === breakpoint ? inherited.state : STYLE_BREAKPOINT_TITLE_MAP[inherited.breakpoint];
  return { from, value };
};
