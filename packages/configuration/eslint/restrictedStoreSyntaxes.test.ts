import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import { describe } from "vitest";

describe("restrictedStoreSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedStoreSyntaxes,
    fixtures: [
      {
        filePath: "storeDotRead.vue",
        name: "storeDotRead",
        source: '<script setup lang="ts">\nconst a = roomStore.rooms;\n</script>',
        violations: 1,
      },
      {
        filePath: "storeToRefsDestructure.vue",
        name: "storeToRefsDestructure",
        source:
          '<script setup lang="ts">\nconst { createRoom } = roomStore;\nconst { rooms } = storeToRefs(roomStore);\n</script>',
        violations: 0,
      },
    ],
  });
});
