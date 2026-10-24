import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { setStyleProperty } from "@/services/pageBuilder/setStyleProperty";
import { describe, expect, test } from "vitest";

describe(setStyleProperty, () => {
  test("reset removes an override", () => {
    expect.hasAssertions();

    const style = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red", width: "10px" } } };

    expect(setStyleProperty(style, StyleBreakpoint.Base, StyleState.Default, "color", "")).toStrictEqual({
      [StyleBreakpoint.Base]: { [StyleState.Default]: { width: "10px" } },
    });
  });

  test("a value is set at its breakpoint and state alone", () => {
    expect.hasAssertions();

    expect(setStyleProperty(undefined, StyleBreakpoint.Tablet, StyleState.Hover, "color", "red")).toStrictEqual({
      [StyleBreakpoint.Tablet]: { [StyleState.Hover]: { color: "red" } },
    });
  });
});
