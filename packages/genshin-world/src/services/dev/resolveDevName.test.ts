import { resolveDevName } from "#src/services/dev/resolveDevName";
import { describe, expect, test } from "vitest";

describe(resolveDevName, () => {
  const ENTRIES = ["Crystal Core", "Crystal Core Ore", "Sample Ore"];
  const KIND = "item";

  test("the name a line gives resolves ignoring case, even where a longer name holds it", () => {
    expect.hasAssertions();

    expect(resolveDevName(ENTRIES, (entry) => entry, "crystal core", KIND)).toStrictEqual({
      entry: "Crystal Core",
      ok: true,
    });
  });

  test("a name only one entry holds resolves to it", () => {
    expect.hasAssertions();

    expect(resolveDevName(ENTRIES, (entry) => entry, "Sample", KIND)).toStrictEqual({ entry: "Sample Ore", ok: true });
  });

  test("a name several entries hold lists their names", () => {
    expect.hasAssertions();

    expect(resolveDevName(ENTRIES, (entry) => entry, "Crystal", KIND)).toStrictEqual({
      error: "Crystal names more than one item; did you mean Crystal Core, Crystal Core Ore?",
      ok: false,
    });
  });

  test("a bad name answers its error and lists up to five nearest names by substring", () => {
    expect.hasAssertions();

    const MANY_ENTRIES = ["Ore A", "Ore B", "Ore C", "Ore D", "Ore E", "Ore F"];

    expect(resolveDevName(MANY_ENTRIES, (entry) => entry, "Ore", KIND)).toStrictEqual({
      error: "Ore names more than one item; did you mean Ore A, Ore B, Ore C, Ore D, Ore E?",
      ok: false,
    });
    expect(resolveDevName(ENTRIES, (entry) => entry, "Zzz", KIND)).toStrictEqual({
      error: "unknown item Zzz",
      ok: false,
    });
  });
});
