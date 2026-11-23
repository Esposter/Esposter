import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_TRIM_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedTrimSyntaxes";
import { describe } from "vitest";

describe("restrictedTrimSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_TRIM_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "normalizeStringImport.vue",
        name: "normalizeStringImport",
        source:
          '<script setup lang="ts">\nimport { normalizeString } from "@esposter/shared";\nconst a = normalizeString(b);\n</script>',
        violations: 1,
      },
      {
        filePath: "services/normalizeStringService.ts",
        name: "normalizeStringService",
        source: 'import { normalizeString } from "@esposter/shared";\nexport const a = normalizeString(b);',
        violations: 0,
      },
      {
        filePath: "trimCall.vue",
        name: "trimCall",
        source: '<script setup lang="ts">\nconst a = b.trim();\n</script>',
        violations: 1,
      },
      {
        filePath: "rawInputSent.vue",
        name: "rawInputSent",
        source: '<script setup lang="ts">\nconst a = await createRoom.mutate({ name: b });\n</script>',
        violations: 0,
      },
    ],
  });
});
