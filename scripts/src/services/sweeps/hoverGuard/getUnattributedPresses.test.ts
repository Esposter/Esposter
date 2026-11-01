import { getUnattributedPresses } from "#src/services/sweeps/hoverGuard/getUnattributedPresses";
import { describe, expect, test } from "vitest";

describe(getUnattributedPresses, () => {
  // A scan that reports nothing reads exactly like a clean tree, so it owes a planted violation it does report first
  test("reports a press that names the pointer's active state and not the pad's attribute, with its line", () => {
    expect.hasAssertions();

    expect(
      getUnattributedPresses(
        '.a {\n  color: red;\n}\n\n.b:is(:active, [data-interaction-state="Pressed"] *) {\n  color: blue;\n}',
      ),
    ).toStrictEqual(['5: .b:is(:active, [data-interaction-state="Pressed"] *)']);
  });

  test("reports a bare active state", () => {
    expect.hasAssertions();

    expect(getUnattributedPresses(".a:active {\n  color: blue;\n}")).toStrictEqual(["1: .a:active"]);
  });

  test("skips a press that names the attribute", () => {
    expect.hasAssertions();

    expect(getUnattributedPresses(".a:is(:active, [data-pressed]) {\n  color: blue;\n}")).toStrictEqual([]);
  });

  test("skips a selector that only contains the text of the state", () => {
    expect.hasAssertions();

    expect(getUnattributedPresses(".a:active-character {\n  color: blue;\n}")).toStrictEqual([]);
  });

  test("skips an active state named in a comment", () => {
    expect.hasAssertions();

    expect(getUnattributedPresses("/* .a:active { } */\n.a {\n  color: red;\n}")).toStrictEqual([]);
  });
});
