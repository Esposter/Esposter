import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

import { ResourceType } from "@esposter/db-schema";

export const ResourceTypeDescriptionMap = {
  [ResourceType.Dashboard]: "Compose charts and visuals over your data.",
  [ResourceType.Email]: "Design an email with a drag-and-drop editor.",
  [ResourceType.Flowchart]: "Draw flows and node diagrams.",
  [ResourceType.Table]: "Edit tabular data like a spreadsheet.",
  [ResourceType.Webpage]: "Design and publish a web page.",
} as const satisfies Record<CreatableResourceType, string>;
