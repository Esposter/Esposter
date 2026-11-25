import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Nuxt runs the app's plugins in the order their filenames sort, so each carries a two-digit prefix that states its
// Place. The tRPC plugin provides `$trpc`, and a store reads it once in its setup, so a plugin that runs first and
// Creates a store leaves that store holding no client for the rest of the session
describe("nuxtPluginOrder", () => {
  const PLUGIN_DIRECTORY = join(REPOSITORY_ROOT, "apps/web/app/plugins");
  const TRPC_PLUGIN_FILENAME = "02.trpc.ts";
  const pluginFilenames = readdirSync(PLUGIN_DIRECTORY)
    .filter((filename) => !filename.endsWith(".test.ts"))
    .toSorted();

  test("every plugin carries its own two-digit prefix", () => {
    expect.hasAssertions();

    const unprefixed = pluginFilenames.filter((filename) => !/^\d{2}\./u.test(filename));
    const prefixes = pluginFilenames.map((filename) => filename.slice(0, 3));

    expect({ isEachPrefixUnique: new Set(prefixes).size === prefixes.length, unprefixed }).toStrictEqual({
      isEachPrefixUnique: true,
      unprefixed: [],
    });
  });

  test("no plugin that runs before the tRPC plugin creates a store", () => {
    expect.hasAssertions();

    const earlierPluginFilenames = pluginFilenames.slice(0, pluginFilenames.indexOf(TRPC_PLUGIN_FILENAME));
    const offenders = earlierPluginFilenames.filter((filename) =>
      /\buse[A-Z]\w*Store\(/u.test(readFileSync(join(PLUGIN_DIRECTORY, filename), "utf8")),
    );

    expect({ hasTrpcPlugin: pluginFilenames.includes(TRPC_PLUGIN_FILENAME), offenders }).toStrictEqual({
      hasTrpcPlugin: true,
      offenders: [],
    });
  });
});
