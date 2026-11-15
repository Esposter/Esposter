import packageJson from "#package.json" with { type: "json" };
import { dirname, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

import nuxtTsconfig from "../.nuxt/tsconfig.app.json" with { type: "json" };

describe("imports", () => {
  // Nuxt and Vite resolve `#shared` and `#server` through Nuxt's own aliases before the manifest, and Node through the
  // Manifest alone, so a name both declare must reach one folder or a script and the app read two different files. Nuxt
  // Writes the aliases it resolves into its generated tsconfig, beside which they are relative
  test.each(["#server", "#shared"] as const)(
    "resolves %s to one folder through Nuxt's alias and the manifest",
    (name) => {
      expect.hasAssertions();

      const [nuxtTarget = ""] = nuxtTsconfig.compilerOptions.paths[name];

      expect(relative(join(import.meta.dirname, ".."), join(import.meta.dirname, "..", ".nuxt", nuxtTarget))).toBe(
        relative(".", dirname(packageJson.imports[`${name}/*`])),
      );
    },
  );
});
