import { StyleState } from "#shared/models/pageBuilder/style/StyleState";

// Hover also answers keyboard focus, so no hover-only affordance ships
export const StyleStateSelectorMap = {
  [StyleState.Default]: (selector: string) => selector,
  [StyleState.Hover]: (selector: string) => `${selector}:hover,${selector}:focus-visible`,
} as const satisfies Record<StyleState, (selector: string) => string>;
