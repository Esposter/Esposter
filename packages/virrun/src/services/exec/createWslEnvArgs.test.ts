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
          npm_config_package_import_method: "copy",
          npm_config_store_dir: "C:\\repo\\.virrun\\store\\pnpm",
        },
      }),
    ).toStrictEqual([
      "npm_config_package_import_method=copy",
      "npm_config_store_dir=/wsl/C:\\repo\\.virrun\\store\\pnpm",
    ]);
  });
});
