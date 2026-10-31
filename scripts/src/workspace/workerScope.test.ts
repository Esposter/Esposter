import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import { build } from "vite";
import { assert, describe, expect, test } from "vitest";

const getPackageDirectory = (path: string): string => {
  const directory = dirname(path);
  return existsSync(join(directory, "package.json")) ? directory : getPackageDirectory(directory);
};

/**
 * A worker that throws as it evaluates never starts, and the page reports only that its script evaluation failed. A
 * module's top level can read a global that a window or Node has and a worker lacks, several imports out from the
 * worker, so no lint of the worker's own imports can see it. Every worker entry is built and run in a scope that has
 * the globals a worker has and none that a window or Node adds, so a worker that cannot load is flagged by its path
 * without anyone listing it.
 */
describe("workerScope", () => {
  // Every `*.worker.ts`, and the service worker, which the PWA module fixes at `service-worker/sw.ts`
  const WORKER_ENTRY_PATHSPECS = [":(glob)**/*.worker.ts", ":(glob)**/service-worker/sw.ts"];
  // What a worker has and Node also has. `process`, `Buffer`, `global` and `setImmediate` are Node's alone and `window`
  // And `document` are a window's alone, so none is handed over and reading one as the script loads throws. A global a
  // Worker has that is missing here is added by name, since the failure names it
  const WORKER_GLOBAL_NAMES = [
    "AbortController",
    "AbortSignal",
    "atob",
    "Blob",
    "btoa",
    "clearInterval",
    "clearTimeout",
    "console",
    "crypto",
    "Event",
    "EventTarget",
    "fetch",
    "Headers",
    "MessageChannel",
    "MessagePort",
    "navigator",
    "performance",
    "queueMicrotask",
    "Request",
    "Response",
    "setInterval",
    "setTimeout",
    "structuredClone",
    "TextDecoder",
    "TextEncoder",
    "URL",
    "URLSearchParams",
  ];

  test.each(readSweepFilePaths(...WORKER_ENTRY_PATHSPECS))(
    "%s evaluates in a worker scope that has no window, process or document",
    async (path) => {
      expect.hasAssertions();

      const entryPath = resolve(REPOSITORY_ROOT, path);
      const builds = await build({
        build: {
          lib: { entry: entryPath, fileName: "worker", formats: ["es"] },
          // One script, so a dynamic import is run rather than left as a request the scope cannot answer
          rolldownOptions: { output: { codeSplitting: false } },
          write: false,
        },
        configFile: false,
        // A library build leaves it as written, and the PWA module defines it as it builds the service worker
        define: { "process.env.NODE_ENV": '"production"' },
        logLevel: "silent",
        resolve: { tsconfigPaths: true },
        root: getPackageDirectory(entryPath),
      });
      const chunk = [builds]
        .flat()
        .flatMap((result) => ("output" in result ? result.output : []))
        .find((output) => output.type === "chunk");
      assert.exists(chunk);
      const scope: Record<string, unknown> = {
        ...Object.fromEntries(WORKER_GLOBAL_NAMES.map((name) => [name, Reflect.get(globalThis, name)])),
        // The service worker spreads the precache list the PWA module injects
        __WB_MANIFEST: [],
        addEventListener: () => undefined,
        location: pathToFileURL(entryPath),
        postMessage: () => undefined,
      };
      scope.self = scope;

      expect(() => runInNewContext(chunk.code, scope)).not.toThrow();
    },
  );
});
