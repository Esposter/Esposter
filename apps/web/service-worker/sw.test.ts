import { runInNewContext } from "node:vm";
import { build } from "vite";
import { assert, describe, expect, test } from "vitest";

// A worker that throws as it evaluates never registers, and the page reports only that its script evaluation failed.
// So the built worker is run in a scope that has what a worker has and none of what a window or Node adds
describe("sw", () => {
  test("evaluates in a worker scope that has no window, process or document", async () => {
    expect.hasAssertions();

    const builds = await build({
      build: { lib: { entry: "sw.ts", fileName: "sw", formats: ["es"] }, write: false },
      configFile: false,
      // The module defines it as it builds the worker, and a library build leaves it as written
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      root: import.meta.dirname,
    });
    const chunk = [builds]
      .flat()
      .flatMap((result) => ("output" in result ? result.output : []))
      .find((output) => output.type === "chunk");
    assert.exists(chunk);
    const listenerTypes: string[] = [];
    const scope: Record<string, unknown> = {
      // The module injects the precache list the worker spreads
      __WB_MANIFEST: [],
      addEventListener: (type: string) => {
        listenerTypes.push(type);
      },
      console,
      Headers,
      location: new URL(import.meta.url),
      Request,
      Response,
      setTimeout,
      URL,
    };
    scope.self = scope;
    runInNewContext(chunk.code, scope);

    expect([...new Set(listenerTypes)].toSorted()).toStrictEqual([
      "activate",
      "fetch",
      "install",
      "message",
      "notificationclick",
      "push",
    ]);
  });
});
