import { NUXT_OUTPUT_DIRECTORY } from "@/services/configuration/constants";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { toRootAnchoredExclude } from "@/services/exec/util/toRootAnchoredExclude";
import { resolveMirrorExcludes } from "@/services/exec/wsl/resolveMirrorExcludes";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveMirrorExcludes, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(cleanup);

  // Only the two constants name a segment at any depth. A derived entry names one place, so it is anchored — a
  // Root-level prepare output (`.nuxt`, what a workspace-root nuxt.config resolves to) left bare would keep every
  // Package's `.nuxt` out of the mirror and mask them all out of the write-back.
  test("anchors every derived entry and leaves only the depth-free names bare", () => {
    expect.hasAssertions();

    expect(resolveMirrorExcludes(create(), [NUXT_OUTPUT_DIRECTORY])).toStrictEqual([
      NODE_MODULES_DIRECTORY,
      GIT_DIRECTORY,
      toRootAnchoredExclude(NUXT_OUTPUT_DIRECTORY),
    ]);
  });

  // The caller's outputs are the ones its prepare layer actually built. Re-reading the config here would miss an
  // `environment` passed programmatically, and the mask would then omit the very directory the layer regenerates.
  test("takes the caller's resolved prepare outputs rather than re-reading the config", () => {
    expect.hasAssertions();

    expect(resolveMirrorExcludes(create(), [])).toStrictEqual([NODE_MODULES_DIRECTORY, GIT_DIRECTORY]);
  });
});
