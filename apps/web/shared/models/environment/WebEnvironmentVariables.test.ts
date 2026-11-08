import { webEnvironmentVariablesSchema } from "#shared/models/environment/WebEnvironmentVariables";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";

describe("webEnvironmentVariablesSchema", () => {
  test("declares exactly the variables .env.example names", () => {
    expect.hasAssertions();

    const names = Object.keys(parseEnv(readFileSync(join(import.meta.dirname, "../../../.env.example"), "utf8")));
    expect(names.toSorted()).toStrictEqual(Object.keys(webEnvironmentVariablesSchema.shape).toSorted());
  });
});
