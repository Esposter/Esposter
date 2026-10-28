import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";
import type { StyleState } from "#shared/models/pageBuilder/StyleState";

// Whether a record holds no entries, which a state or a breakpoint is once a reset has emptied it
const checkIsEmpty = (record: object) => Object.keys(record).length === 0;
// The style with one property set at a breakpoint and state. An empty value removes the override, so the property
// Inherits again, and every other property at that breakpoint and state is left as it was. A state or a breakpoint a
// Reset empties is dropped with it, so no empty object is left in the style
export const setStyleProperty = (
  style: NodeStyle | undefined,
  breakpoint: StyleBreakpoint,
  state: StyleState,
  property: StyleProperty,
  value: string,
): NodeStyle => {
  const fields = Object.fromEntries(
    Object.entries(style?.[breakpoint]?.[state] ?? {}).filter(([name]) => name !== property),
  );
  const nextFields = value === "" ? fields : { ...fields, [property]: value };
  const states = Object.fromEntries(
    Object.entries({ ...style?.[breakpoint], [state]: nextFields }).filter(
      ([, stateFields]) => !checkIsEmpty(stateFields ?? {}),
    ),
  );

  return Object.fromEntries(
    Object.entries({ ...style, [breakpoint]: states }).filter(
      ([, breakpointStates]) => !checkIsEmpty(breakpointStates ?? {}),
    ),
  );
};
