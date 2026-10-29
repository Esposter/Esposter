import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("trpc-nuxt-module", () => {
  // The module entry and, since the runtime ships one file per source file, the file each side of the app loads first
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
  const distClientFile = resolve(import.meta.dirname, "../dist/runtime/client/createTRPCNuxtClient.js");
  const distServerFile = resolve(import.meta.dirname, "../dist/runtime/server/createTRPCEventHandler.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: up to 4 KB"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: up to 0.5 KB"`);
  });

  test("client runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distClientFile)).toMatchInlineSnapshot(`"createTRPCNuxtClient.js: up to 2 KB"`);
  });

  test("server runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distServerFile)).toMatchInlineSnapshot(`"createTRPCEventHandler.js: up to 2 KB"`);
  });
});
