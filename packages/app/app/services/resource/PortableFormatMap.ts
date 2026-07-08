import type { PortableResourceType } from "#shared/models/resource/PortableResourceType";
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { ResourceType } from "@esposter/db-schema";
// Import/export formats land with each portable type's blade migration (roadmap Phase 3-4); skeleton for now.
export const PortableFormatMap: Record<PortableResourceType, PortableFormat[]> = {
  [ResourceType.Email]: [],
  [ResourceType.File]: [],
};
