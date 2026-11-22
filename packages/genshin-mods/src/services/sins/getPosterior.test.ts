import { describe, expect, test } from "vitest";

import { SIN_PRIOR } from "./constants";
import { getPosterior } from "./getPosterior";

describe(getPosterior, () => {
  test("reads a sin with no evidence as the flat prior", () => {
    expect.hasAssertions();

    expect(getPosterior([])).toStrictEqual({ alpha: SIN_PRIOR, beta: SIN_PRIOR });
  });
});
