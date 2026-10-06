import type { ResourceLinkType } from "@esposter/db-schema";

import { resourceLinkRegistry } from "#shared/services/resource/link/resourceLinkRegistry";
import { z } from "zod";

// The one way a content shape holds another resource's id. The declaration is the link: the resource-link index
// Reads every type's link fields off its content schema, so a field written as a bare `z.uuid()` is a reference
// Nothing can find (/docs/architecture/resource-links)
export const createResourceLinkSchema = (resourceLinkType: ResourceLinkType) =>
  z.uuid().register(resourceLinkRegistry, { resourceLinkType });
