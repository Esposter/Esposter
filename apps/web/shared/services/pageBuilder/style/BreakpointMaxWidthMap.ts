import { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";

// The widest viewport, in CSS pixels, each breakpoint below the base applies at
export const BreakpointMaxWidthMap = { [Breakpoint.Mobile]: 478, [Breakpoint.Tablet]: 991 } as const satisfies Record<
  Exclude<Breakpoint, Breakpoint.Desktop>,
  number
>;
