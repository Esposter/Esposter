import { getSystemTarPath } from "#src/services/shared/getSystemTarPath";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getSystemTarPath, () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  afterEach(() => {
    if (originalPlatform) Object.defineProperty(process, "platform", originalPlatform);
  });

  test("the system's tar runs from System32 on windows", () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "win32" });
    vi.stubEnv("SystemRoot", String.raw`C:\Windows`);

    expect(getSystemTarPath()).toBe(join(String.raw`C:\Windows`, "System32", "tar.exe"));
  });

  test("the system's tar runs from /usr/bin on macos", () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { value: "darwin" });

    expect(getSystemTarPath()).toBe("/usr/bin/tar");
  });
});
