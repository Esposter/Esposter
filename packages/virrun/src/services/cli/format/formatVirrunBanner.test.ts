import { BackendType } from "@/models/virrun/BackendType";
import { formatVirrunBanner } from "@/services/cli/format/formatVirrunBanner";
import { describe, expect, test } from "vitest";

describe(formatVirrunBanner, () => {
  test("joins a multi-token command and reports backend and node version", () => {
    expect.hasAssertions();

    expect(formatVirrunBanner({ backend: BackendType.Os, command: ["oxfmt", "--check"], nodeVersion: "v26.4.0" })).toBe(
      '[virrun] running "oxfmt --check" (backend=os, node=v26.4.0)',
    );
  });

  test("renders a single-token command without trailing space", () => {
    expect.hasAssertions();

    expect(formatVirrunBanner({ backend: BackendType.Native, command: ["node"], nodeVersion: "v26.4.0" })).toBe(
      '[virrun] running "node" (backend=native, node=v26.4.0)',
    );
  });
});
