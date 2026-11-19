import { DASHBOARD_BREAKPOINTS } from "#src/services/dashboard/constants";
import { getBreakpointColumnNumber } from "#src/services/dashboard/grid/getBreakpointColumnNumber";
import { describe, expect, test } from "vitest";

describe(getBreakpointColumnNumber, () => {
  test.each(DASHBOARD_BREAKPOINTS)(
    "takes the columns of the widest breakpoint a $minimumWidth pixel width reaches",
    ({ columnNumber, minimumWidth }) => {
      expect.hasAssertions();

      expect(getBreakpointColumnNumber(minimumWidth)).toBe(columnNumber);
    },
  );
});
