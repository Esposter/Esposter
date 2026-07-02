import { formatVirrunProvisioning } from "@/services/cli/format/formatVirrunProvisioning";
import { describe, expect, test } from "vitest";

describe(formatVirrunProvisioning, () => {
  const hash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  test("announces a snapshot cache miss when no snapshot exists", () => {
    expect.hasAssertions();

    expect(formatVirrunProvisioning({ exists: false, hash })).toBe(
      "[virrun] snapshot cache miss (lockfile 0123456789ab) — installing toolchain once (may take minutes); later runs reuse it",
    );
  });

  test("announces a snapshot cache hit when the snapshot is warm", () => {
    expect.hasAssertions();

    expect(formatVirrunProvisioning({ exists: true, hash })).toBe(
      "[virrun] snapshot cache hit (lockfile 0123456789ab)",
    );
  });
});
