import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { getStyleInheritance } from "@/services/pageBuilder/getStyleInheritance";
import { describe, expect, test } from "vitest";

describe(getStyleInheritance, () => {
  test("a field shows the inherited value and where it comes from", () => {
    expect.hasAssertions();

    const style = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } };

    expect(getStyleInheritance(style, StyleBreakpoint.Tablet, StyleState.Default, "color")).toStrictEqual({
      from: "Desktop",
      value: "red",
    });
  });

  test("a hover field with no hover of its own falls back to its default", () => {
    expect.hasAssertions();

    const style = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } };

    expect(getStyleInheritance(style, StyleBreakpoint.Base, StyleState.Hover, "color")).toStrictEqual({
      from: "Default",
      value: "red",
    });
  });
});
