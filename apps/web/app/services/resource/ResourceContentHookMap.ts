import type { ResourceType } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { createHookRegistry } from "@/services/shared/createHookRegistry";

// Cross-store hooks over a resource's content, so a write that replaces the content of a resource a blade
// Already has open reaches the surface holding it — rather than the blade being keyed on a counter somebody
// Bumps, which is a manual refresh wearing a reactive disguise.
// Both carry the type the content was replaced for, because a content store outlives the blade that opened it:
// Without it the store for the type the open resource is *not* would re-read this resource's blob through its
// Own schema
export const ResourceContentHookMap = {
  // The live document a third-party editor owns takes the content the re-read above just landed. A library
  // That holds the document itself has no ref to re-render from, and holding a pre-restore copy is not a stale
  // View but a write-back clobber: its next autosave carries the old document at the restore's own fresh
  // ContentVersion, which the server accepts (/docs/architecture/third-party-document-adapters)
  Adopt: createHookRegistry<(type: ResourceType) => Promisable<void>>(),
  // The working copy was replaced wholesale, which a restore is the one write to do. Registered by the content
  // Stores, which re-read their own blob; every Vue-rendered type is finished here, because its blade renders
  // The ref this refills
  Reload: createHookRegistry<(type: ResourceType) => Promisable<void>>(),
};
