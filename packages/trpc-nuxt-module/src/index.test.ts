import { getFileSize, KIBIBYTE } from "@esposter/configuration";
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

    expect(getFileSize(distFile)).toBeLessThanOrEqual(4 * KIBIBYTE);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSize(distDtsFile)).toBeLessThanOrEqual(0.5 * KIBIBYTE);
  });

  test("client runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distClientFile)).toBeLessThanOrEqual(2 * KIBIBYTE);
  });

  test("server runtime bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distServerFile)).toBeLessThanOrEqual(2 * KIBIBYTE);
  });
});
