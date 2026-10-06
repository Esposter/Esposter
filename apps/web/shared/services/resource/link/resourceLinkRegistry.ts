import type { ResourceLinkType } from "@esposter/db-schema";

import { z } from "zod";

// Which schema fields hold another resource's id, and as what. A registry of its own rather than the global one,
// Which schema forms read for their layout, so neither reader can mistake the other's metadata for its own
export const resourceLinkRegistry = z.registry<{ resourceLinkType: ResourceLinkType }>();
