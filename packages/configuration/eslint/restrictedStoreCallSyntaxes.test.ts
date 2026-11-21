import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedStoreCallSyntaxes from "@esposter/configuration/eslint/restrictedStoreCallSyntaxes.js";
import { describe } from "vitest";

describe("restrictedStoreCallSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedStoreCallSyntaxes,
    fixtures: [
      {
        filePath: "app/store/room.ts",
        name: "storeSourceMethodCall",
        source: "export const a = () => roomStore.createRoom(b);",
        violations: 1,
      },
      {
        filePath: "app/store/room.ts",
        name: "storeSourceRefRead",
        source: "export const a = () => roomStore.rooms;",
        violations: 0,
      },
      {
        filePath: "app/store/room.ts",
        name: "storeSourceDestructuredCall",
        source: "export const a = () => { const { createRoom } = roomStore; return createRoom(b); };",
        violations: 0,
      },
    ],
  });
});
