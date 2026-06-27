import { createWslEnvArgs } from "@/services/exec/createWslEnvArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/readWslPath"), () => ({
  readWslPath: (path: string) => `/wsl/${path}`,
}));

describe(createWslEnvArgs, () => {
  test("translates pnpm store paths while preserving scalar env values", () => {
    expect.hasAssertions();

    expect(
      createWslEnvArgs({
        env: {
          COREPACK_HOME: "C:\\repo\\.virrun\\store\\corepack",
          PNPM_CONFIG_PACKAGE_IMPORT_METHOD: "copy",
          PNPM_CONFIG_STORE_DIR: "C:\\repo\\.virrun\\store\\pnpm",
        },
      }),
    ).toStrictEqual([
      "COREPACK_HOME=/wsl/C:\\repo\\.virrun\\store\\corepack",
      "PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy",
      "PNPM_CONFIG_STORE_DIR=/wsl/C:\\repo\\.virrun\\store\\pnpm",
    ]);
  });
});
