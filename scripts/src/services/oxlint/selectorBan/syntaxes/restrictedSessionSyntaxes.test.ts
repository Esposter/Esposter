import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_SESSION_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedSessionSyntaxes";
import { describe } from "vitest";

describe("restrictedSessionSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_SESSION_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "app/components/bareSession.vue",
        name: "bareSession",
        source: '<script setup lang="ts">\nconst session = authClient.useSession();\n</script>',
        violations: 1,
      },
      {
        filePath: "app/composables/fetchedSession.ts",
        name: "fetchedSession",
        source: "export const useThing = () => authClient.useSession(useFetch);",
        violations: 0,
      },
      {
        filePath: "app/components/sessionData.vue",
        name: "sessionData",
        source: '<script setup lang="ts">\nconst session = useSessionData();\n</script>',
        violations: 0,
      },
    ],
  });
});
