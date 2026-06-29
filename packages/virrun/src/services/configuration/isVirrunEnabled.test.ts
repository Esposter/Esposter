import { isVirrunEnabled } from "@/services/configuration/isVirrunEnabled";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { describe, expect, test } from "vitest";

describe(isVirrunEnabled, () => {
  test("is off when the flag is unset", () => {
    expect.hasAssertions();

    expect(isVirrunEnabled({})).toBe(false);
  });

  test.each(["true", "TRUE", " true ", "True"])("is on for the canonical value %j", (value) => {
    expect.hasAssertions();

    expect(isVirrunEnabled({ [VIRRUN_ENV_KEY]: value })).toBe(true);
  });

  test.each(["", "1", "0", "false", "yes", "on"])("is off for any other value %j", (value) => {
    expect.hasAssertions();

    expect(isVirrunEnabled({ [VIRRUN_ENV_KEY]: value })).toBe(false);
  });
});
