import { isColorEnabled } from "@/services/cli/color/isColorEnabled";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const originalIsTTY = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");
const stubIsTTY = (isTTY: boolean): void => {
  Object.defineProperty(process.stderr, "isTTY", { configurable: true, value: isTTY });
};

describe(isColorEnabled, () => {
  beforeEach(() => {
    vi.stubEnv("NO_COLOR", "");
    vi.stubEnv("FORCE_COLOR", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalIsTTY) Object.defineProperty(process.stderr, "isTTY", originalIsTTY);
    else Reflect.deleteProperty(process.stderr, "isTTY");
  });

  test(`returns false when NO_COLOR is set even if FORCE_COLOR is set`, () => {
    expect.hasAssertions();

    vi.stubEnv("NO_COLOR", "1");
    vi.stubEnv("FORCE_COLOR", "1");

    expect(isColorEnabled()).toBe(false);
  });

  test(`returns true when FORCE_COLOR is set and NO_COLOR is not`, () => {
    expect.hasAssertions();

    vi.stubEnv("FORCE_COLOR", "1");

    expect(isColorEnabled()).toBe(true);
  });

  test(`returns false when FORCE_COLOR is "0"`, () => {
    expect.hasAssertions();

    vi.stubEnv("FORCE_COLOR", "0");
    stubIsTTY(true);

    expect(isColorEnabled()).toBe(false);
  });

  test(`falls back to the stderr TTY state when no env override is set`, () => {
    expect.hasAssertions();

    stubIsTTY(true);

    expect(isColorEnabled()).toBe(true);

    stubIsTTY(false);

    expect(isColorEnabled()).toBe(false);
  });
});
