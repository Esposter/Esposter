import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { StyleState } from "#shared/models/pageBuilder/StyleState";

// The style with one property set at a breakpoint and state. An empty value removes the override, so the property
// Inherits again, and every other property at that breakpoint and state is left as it was
export const setStyleProperty = (
  style: NodeStyle | undefined,
  breakpoint: StyleBreakpoint,
  state: StyleState,
  property: StyleProperty,
  value: string,
): NodeStyle => {
  const fields = style?.[breakpoint]?.[state] ?? {};
  const nextFields =
    value === ""
      ? Object.fromEntries(Object.entries(fields).filter(([name]) => name !== property))
      : { ...fields, [property]: value };

  return { ...style, [breakpoint]: { ...style?.[breakpoint], [state]: nextFields } };
};
