import { ENVIRONMENT_TYPES_PATH } from "@@/scripts/env/constants";
import { getEnvironmentTypes } from "@@/scripts/env/services/getEnvironmentTypes";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe(getEnvironmentTypes, () => {
  test("the committed types are the ones .env.example declares", () => {
    expect.hasAssertions();

    expect(getEnvironmentTypes(), "run `pnpm env:gen` from apps/web").toBe(
      readFileSync(ENVIRONMENT_TYPES_PATH, "utf8"),
    );
  });
});
