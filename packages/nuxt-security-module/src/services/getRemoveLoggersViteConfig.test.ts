import { getRemoveLoggersViteConfig } from "#src/services/getRemoveLoggersViteConfig";
import { describe, expect, test } from "vitest";

describe(getRemoveLoggersViteConfig, () => {
  test("drops console calls through the bundler's compressor, not a regex plugin", () => {
    expect.hasAssertions();

    expect(getRemoveLoggersViteConfig()).toStrictEqual({
      build: { rolldownOptions: { output: { minify: { compress: { dropConsole: true } } } } },
    });
  });
});
