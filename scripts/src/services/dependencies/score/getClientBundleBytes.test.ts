import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";
import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";

import { getClientBundleBytes } from "#src/services/dependencies/score/getClientBundleBytes";
import { describe, expect, test } from "vitest";

describe(getClientBundleBytes, () => {
  const WORKSPACE_PACKAGES: WorkspacePackage[] = [
    { directory: "packages/genshin-world", packageName: "genshin-world" },
  ];
  // A minimal `nuxt analyze` raw-data report: the app's entry module and one scoped part in the entry bundle, every
  // Other part in a lazy bundle
  const REPORT: ClientBundleReport = {
    nodeMetas: {
      app: { id: "/apps/web/app/pages/index.vue", isEntry: true, moduleParts: { "entry.js": "appPart" } },
      genshin: {
        id: "/packages/genshin-world/src/index.ts",
        isEntry: false,
        moduleParts: { "lazy.js": "genshinPart" },
      },
      scoped: {
        id: "/node_modules/.pnpm/@vue+shared@3.5.43/node_modules/@vue/shared/dist/shared.js",
        isEntry: false,
        moduleParts: { "entry.js": "scopedPart", "lazy.js": "scopedSecondPart" },
      },
      unscoped: {
        id: "../node_modules/.pnpm/vue-phaserjs@1.0.0/node_modules/vue-phaserjs/dist/index.js?v=abc",
        isEntry: false,
        moduleParts: { "lazy.js": "unscopedPart" },
      },
    },
    nodeParts: {
      appPart: { gzipLength: 1 },
      genshinPart: { gzipLength: 2 },
      scopedPart: { gzipLength: 3 },
      scopedSecondPart: { gzipLength: 4 },
      unscopedPart: { gzipLength: 5 },
    },
  };

  test("gives each module's gzipped bytes to the package that owns it, with the entry chunk's counted apart", () => {
    expect.hasAssertions();

    expect(getClientBundleBytes(REPORT, WORKSPACE_PACKAGES)).toStrictEqual(
      new Map([
        ["@esposter/web", { bytes: 1, entryBytes: 1 }],
        ["@vue/shared", { bytes: 7, entryBytes: 3 }],
        ["genshin-world", { bytes: 2, entryBytes: 0 }],
        ["vue-phaserjs", { bytes: 5, entryBytes: 0 }],
      ]),
    );
  });
});
