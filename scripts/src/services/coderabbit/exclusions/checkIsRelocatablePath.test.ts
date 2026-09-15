import { checkIsRelocatablePath } from "#src/services/coderabbit/exclusions/checkIsRelocatablePath";
import { describe, expect, test } from "vitest";

describe(checkIsRelocatablePath, () => {
  // The paths are the value under test: this classifier reads nothing but the suffix and the leading directory
  test.each([
    "apps/web/content/docs/architecture/no-polling.md",
    ".agents/skills/coderabbit/SKILL.md",
    ".coderabbit.yaml",
    ".github/workflows/ci.yml",
    "packages/shared/package.json",
    "apps/web/vitest.config.ts",
    "packages/db-schema/src/schema/message.ts",
    "apps/web/server/db/migrations/0001_init.sql",
    "apps/web/app/components/Styled/Dialog.vue",
    "apps/web/app/layouts/default.vue",
    "apps/web/app/middleware/auth.ts",
    "apps/web/app/pages/index.vue",
    "apps/web/app/plugins/trpc.ts",
    "apps/web/public/favicon.ico",
    "apps/web/server/api/trpc/[trpc].ts",
    "apps/web/server/plugins/migrate.ts",
    "apps/web/server/routes/ws.ts",
  ])("keeps moving %s a decision", (path) => {
    expect.hasAssertions();

    expect(checkIsRelocatablePath(path)).toBe(false);
  });

  // A test moves with its subject in every sweep there is, and where it sits claims nothing about behaviour
  test.each([
    "apps/web/app/store/alert.test.ts",
    "packages/shared/src/types.test-d.ts",
    "apps/web/app/store/alert.ts",
    // Auto-imported by export name, scanned recursively: the path is not the name
    "apps/web/app/composables/message/useMessage.ts",
    "scripts/src/coderabbit/feedback/index.ts",
  ])("lets %s be moved mechanically", (path) => {
    expect.hasAssertions();

    expect(checkIsRelocatablePath(path)).toBe(true);
  });
});
