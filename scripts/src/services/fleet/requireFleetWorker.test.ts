import { requireFleetWorker } from "#src/services/fleet/requireFleetWorker";
import { describe, expect, test } from "vitest";

describe(requireFleetWorker, () => {
  test("takes a name of letters, digits and dashes", () => {
    expect.hasAssertions();

    expect(requireFleetWorker("mac-kits")).toBe("mac-kits");
  });

  test("refuses a slash, which would make the hold's pid file a missing folder", () => {
    expect.hasAssertions();

    expect(() => requireFleetWorker("mac/kits")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: worker, --worker or FLEET_WORKER names the worker that holds it, in letters, digits and dashes; got "mac/kits"]`,
    );
  });
});
