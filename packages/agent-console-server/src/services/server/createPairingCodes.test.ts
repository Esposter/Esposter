import { createPairingCodes } from "#src/services/server/createPairingCodes";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createPairingCodes, () => {
  const code = crypto.randomUUID();

  afterEach(() => {
    vi.useRealTimers();
  });

  test("pairs once per code", () => {
    expect.hasAssertions();

    const pairingCodes = createPairingCodes();
    pairingCodes.add(code, 1);

    expect(pairingCodes.take(code)).toBe(true);
    expect(pairingCodes.take(code)).toBe(false);
  });

  test("pairs nothing once the code expires", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const pairingCodes = createPairingCodes();
    pairingCodes.add(code, 1);
    vi.advanceTimersByTime(1);

    expect(pairingCodes.take(code)).toBe(false);
  });

  test("keeps a code handed again until its new deadline", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const pairingCodes = createPairingCodes();
    pairingCodes.add(code, 1);
    pairingCodes.add(code, 2);
    vi.advanceTimersByTime(1);

    expect(pairingCodes.take(code)).toBe(true);
  });
});
