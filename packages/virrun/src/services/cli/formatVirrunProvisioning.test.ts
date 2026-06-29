import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { describe, expect, test } from "vitest";

describe(formatVirrunProvisioning, () => {
  const hash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  test("announces a one-time install when no snapshot exists", () => {
    expect.hasAssertions();

    expect(formatVirrunProvisioning({ exists: false, hash })).toBe(
      "[virrun] no sandbox dependency snapshot for lockfile 0123456789ab — installing the toolchain inside the sandbox once (this run may take a few minutes); later runs reuse it",
    );
  });

  test("announces reuse when the snapshot is warm", () => {
    expect.hasAssertions();

    expect(formatVirrunProvisioning({ exists: true, hash })).toBe(
      "[virrun] reusing the sandbox dependency snapshot (lockfile 0123456789ab)",
    );
  });
});
