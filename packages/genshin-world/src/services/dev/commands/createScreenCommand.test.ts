import { ScreenKind } from "#src/models/screen/ScreenKind";
import { createScreenCommand } from "#src/services/dev/commands/createScreenCommand";
import { describe, expect, test } from "vitest";

describe(createScreenCommand, () => {
  test("A screen read names the open screen", () => {
    expect.hasAssertions();

    const result = createScreenCommand({ getScreenKind: () => ScreenKind.PaimonMenu }).run({});

    expect(result).toStrictEqual({ ok: true, value: ScreenKind.PaimonMenu });
  });
});
