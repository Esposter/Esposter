import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_STORE_CALL_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedStoreCallSyntaxes";
import { describe } from "vitest";

describe("restrictedStoreCallSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_STORE_CALL_SYNTAXES.bans,
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
