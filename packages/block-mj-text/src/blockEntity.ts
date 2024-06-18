import type { BlockEntity } from "@/types/generated/BlockEntity";

export const blockEntity = {
  metadata: {
    recordId: {
      entityId: "test-entity",
      editionId: new Date().toISOString(),
    },
    entityTypeId: "https://blockprotocol.org/@blockprotocol/types/entity-type/thing/v/2",
  },
  properties: {
    "https://blockprotocol.org/@blockprotocol/types/property-type/name/": "World",
  },
} as const satisfies BlockEntity;
