import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { readSurveyLogicReference } from "#src/services/evaluator/readSurveyLogicReference";
import { describe, expect, test } from "vitest";

describe(readSurveyLogicReference, () => {
  test.each<[string, string, Pick<SurveyLogicContext, "scopes" | "values">, SurveyLogicValue]>([
    ["reads an answer under its exact name", "name", { scopes: {}, values: { name: "x" } }, "x"],
    [
      "reads an exact answer name holding a dot before a scope of that first part",
      "panel.x",
      { scopes: { panel: { x: 1 } }, values: { "panel.x": 3 } },
      3,
    ],
    ["reads an exact key inside a scope", "panel.name", { scopes: { panel: { name: "x" } }, values: {} }, "x"],
    [
      "reads a dotted path inside a scope the way a top-level path is read",
      "panel.mt.a",
      { scopes: { panel: { mt: { a: 1 } } }, values: {} },
      1,
    ],
    [
      "reads an indexed item inside a scope",
      "panel.items[0].a",
      { scopes: { panel: { items: [{ a: 1 }] } }, values: {} },
      1,
    ],
    [
      "reads the length of a list inside a scope",
      "row.items.length",
      { scopes: { row: { items: [1, 2] } }, values: {} },
      2,
    ],
    [
      "reads nothing inside a scope for a missing path",
      "panel.mt.b",
      { scopes: { panel: { mt: { a: 1 } } }, values: {} },
      undefined,
    ],
    [
      "a scope wins over an answer at the same dotted path",
      "panel.mt.a",
      { scopes: { panel: { mt: { a: 1 } } }, values: { panel: { mt: { a: 2 } } } },
      1,
    ],
  ])("%s", (_title, name, { scopes, values }, expected) => {
    expect.hasAssertions();

    expect(readSurveyLogicReference(name, { now: new Date(0), scopes, values })).toStrictEqual(expected);
  });
});
