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
      {
        filePath: "app/composables/useRoom.ts",
        name: "composableDotRead",
        source: "export const a = () => roomStore.rooms;",
        violations: 1,
      },
      {
        filePath: "app/services/room.ts",
        name: "serviceDotCall",
        source: "export const a = () => roomStore.createRoom(b);",
        violations: 1,
      },
      {
        filePath: "app/composables/useRoom.ts",
        name: "composableStoreToRefs",
        source: "export const a = () => { const { rooms } = storeToRefs(roomStore); return rooms; };",
        violations: 0,
      },
      // A store's own source reads a nested store's refs by dot on purpose, so it is not this entry's domain
      {
        filePath: "app/store/room.ts",
        name: "storeSourceDotRead",
        source: "export const a = () => roomStore.rooms;",
        violations: 0,
      },
      {
        filePath: "app/store/room.test.ts",
        name: "storeTestDotRead",
        source: "export const a = () => roomStore.rooms;",
        violations: 1,
      },
      {
        filePath: "app/composables/useRoom.test.ts",
        name: "appTestDotCall",
        source: "export const a = () => roomStore.createRoom(b);",
        violations: 1,
      },
      // A store's dot-read is a server concern only where a server file names a Store, so the server is out of scope
      {
        filePath: "server/services/room.ts",
        name: "serverDotRead",
        source: "export const a = () => keyframeStore.write(b);",
        violations: 0,
      },
    ],
  });
});
