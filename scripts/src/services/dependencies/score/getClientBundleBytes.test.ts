import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";
import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";

import { getClientBundleBytes } from "#src/services/dependencies/score/getClientBundleBytes";
import { describe, expect, test } from "vitest";

describe(getClientBundleBytes, () => {
  const WORKSPACE_PACKAGES: WorkspacePackage[] = [
    { directory: "packages/genshin-world", packageName: "genshin-world" },
  ];
  // A minimal `nuxt analyze` raw-data report: one part per module, each named by its meta
  const REPORT: ClientBundleReport = {
    nodeMetas: {
      app: { id: "/apps/web/app/pages/index.vue" },
      genshin: { id: "/packages/genshin-world/src/index.ts" },
      scoped: { id: "/node_modules/.pnpm/@vue+shared@3.5.43/node_modules/@vue/shared/dist/shared.js" },
      unscoped: { id: "../node_modules/.pnpm/vue-phaserjs@1.0.0/node_modules/vue-phaserjs/dist/index.js?v=abc" },
    },
    nodeParts: {
      appPart: { gzipLength: 1, metaUid: "app" },
      genshinPart: { gzipLength: 2, metaUid: "genshin" },
      scopedPart: { gzipLength: 3, metaUid: "scoped" },
      scopedSecondPart: { gzipLength: 4, metaUid: "scoped" },
      unscopedPart: { gzipLength: 5, metaUid: "unscoped" },
    },
  };

  test("gives each module's gzipped bytes to the package that owns it, summed per package", () => {
    expect.hasAssertions();

    expect(getClientBundleBytes(REPORT, WORKSPACE_PACKAGES)).toStrictEqual(
      new Map([
        ["@esposter/web", 1],
        ["@vue/shared", 7],
        ["genshin-world", 2],
        ["vue-phaserjs", 5],
      ]),
    );
  });
});
