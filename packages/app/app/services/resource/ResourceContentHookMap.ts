import type { ResourceType } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { createHookRegistry } from "@/services/shared/createHookRegistry";

// Cross-store hooks over a resource's content, so a write that replaces the content of a resource a blade
// Already has open reaches the surface holding it — rather than the blade being keyed on a counter somebody
// Bumps, which is a manual refresh wearing a reactive disguise
export const ResourceContentHookMap = {
  // The working copy was replaced wholesale, which a restore is the one write to do. Carries the type it was
  // Replaced for, because a content store outlives the blade that opened it: without it the store for the type
  // The open resource is *not* would re-read this resource's blob through its own schema.
  // The editor-owned types (GrapesJS, SurveyJS) register nothing — their editor owns the live document once it
  // Has loaded, so adopting content underneath it is a change to those adapters rather than to this hook
  Reload: createHookRegistry<(type: ResourceType) => Promisable<void>>(),
};
