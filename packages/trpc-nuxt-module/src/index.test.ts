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

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 2.32 KB (2378 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 0.34 KB (353 bytes)"`);
  });

  test("client runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distClientFile)).toMatchInlineSnapshot(`"createTRPCNuxtClient.js: 1.40 KB (1431 bytes)"`);
  });

  test("server runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distServerFile)).toMatchInlineSnapshot(`"createTRPCEventHandler.js: 0.83 KB (852 bytes)"`);
  });
});
