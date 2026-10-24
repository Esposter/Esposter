import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { STYLE_BREAKPOINT_CASCADE, STYLE_BREAKPOINT_TITLE_MAP } from "@/services/pageBuilder/constants";

export interface StyleInheritance {
  // Where the value is set: a breakpoint's name, or the default state of the field's own breakpoint
  from: string;
  value: string;
}

// The value a field inherits when it sets none at its breakpoint and state: the nearest one the cascade applies there.
// A hover reaches the default of its own breakpoint after its own hover, and each wider breakpoint's hover and default
export const getStyleInheritance = (
  style: NodeStyle,
  breakpoint: StyleBreakpoint,
  state: StyleState,
  property: StyleProperty,
): StyleInheritance | undefined => {
  const states = state === StyleState.Hover ? [StyleState.Hover, StyleState.Default] : [StyleState.Default];
  const sources = STYLE_BREAKPOINT_CASCADE[breakpoint].flatMap((source) =>
    states.map((sourceState) => ({ breakpoint: source, state: sourceState })),
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
