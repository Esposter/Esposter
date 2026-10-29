import { getParityServerArgs } from "#src/services/genshinParity/load/getParityServerArgs";
import {
  PARITY_BUILD_DIRECTORY_NAME,
  PARITY_CONFIG_PATH,
  VITE_BIN_PATH,
} from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

describe(getParityServerArgs, () => {
  test("should serve the dev server without a preview subcommand", () => {
    expect.hasAssertions();
    expect(getParityServerArgs(true, 1)).toStrictEqual([
      VITE_BIN_PATH,
      "--config",
      PARITY_CONFIG_PATH,
      "--port",
      "1",
      "--strictPort",
    ]);
  });

  test("should serve the dev server forced to bundle its dependencies again", () => {
    expect.hasAssertions();
    expect(getParityServerArgs(true, 1, true)).toStrictEqual([
      VITE_BIN_PATH,
      "--config",
      PARITY_CONFIG_PATH,
      "--port",
      "1",
      "--strictPort",
      "--force",
    ]);
  });

  test("should preview the production build in its output folder", () => {
    expect.hasAssertions();
    expect(getParityServerArgs(false, 1)).toStrictEqual([
      VITE_BIN_PATH,
      "preview",
      "--config",
      PARITY_CONFIG_PATH,
      "--port",
      "1",
      "--strictPort",
      "--outDir",
      PARITY_BUILD_DIRECTORY_NAME,
    ]);
  });
});
