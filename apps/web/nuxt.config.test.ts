import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

describe("nuxt.config", () => {
  // Nuxt loads the configuration with node's own type stripping and falls back to jiti, which transforms the whole
  // Import graph on every load, only when that fails. A suite's imports go through Vite instead, so the load is node's
  // In a process of its own: an enum or an extensionless relative import anywhere in the graph is what fails it. The
  // `defineNuxtConfig` global is Nuxt's, defined before it loads the file
  test("loads natively", () => {
    expect.hasAssertions();

    const configurationUrl = pathToFileURL(`${import.meta.dirname}/nuxt.config.ts`).href;
    const script = `globalThis.defineNuxtConfig = (configuration) => configuration; await import(${JSON.stringify(configurationUrl)});`;

    const { status, stderr, stdout } = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
      encoding: "utf8",
    });

    expect({ status, stderr, stdout }).toStrictEqual({ status: 0, stderr: "", stdout: "" });
  });
});
