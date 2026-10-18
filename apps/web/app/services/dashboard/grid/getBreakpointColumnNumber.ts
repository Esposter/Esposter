import { DASHBOARD_BREAKPOINTS } from "@/services/dashboard/constants";
import { takeOne } from "@esposter/shared";

// The column count of the widest breakpoint the width reaches, so a narrower screen takes fewer columns
export const getBreakpointColumnNumber = (width: number) =>
  takeOne(DASHBOARD_BREAKPOINTS.filter((breakpoint) => width >= breakpoint.minimumWidth)).columnNumber;
