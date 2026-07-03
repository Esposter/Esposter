// oxlint-disable unicorn/no-hex-escape -- \x1b is the conventional, readable spelling of the ANSI ESC in assertions
import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(colorize, () => {
  beforeEach(() => {
    vi.stubEnv("NO_COLOR", "");
    vi.stubEnv("FORCE_COLOR", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test(`wraps text in the color's SGR pair when color is enabled`, () => {
    expect.hasAssertions();

    expect(colorize("", Color.Cyan)).toBe("\x1B[36m\x1B[39m");
  });

  test(`nests colors so each keeps its own reset code`, () => {
    expect.hasAssertions();

    expect(colorize(colorize("", Color.Cyan), Color.Bold)).toBe("\x1B[1m\x1B[36m\x1B[39m\x1B[22m");
  });

  test(`returns the text untouched when color is disabled`, () => {
    expect.hasAssertions();

    vi.stubEnv("NO_COLOR", "1");

    expect(colorize(" ", Color.Red)).toBe(" ");
  });
});
