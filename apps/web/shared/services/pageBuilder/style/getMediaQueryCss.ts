import type { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";

import { BreakpointMaxWidthMap } from "#shared/services/pageBuilder/style/BreakpointMaxWidthMap";

export const getMediaQueryCss = (breakpoint: Exclude<Breakpoint, Breakpoint.Desktop>, css: string) =>
  css ? `@media (max-width:${BreakpointMaxWidthMap[breakpoint]}px){${css}}` : "";
