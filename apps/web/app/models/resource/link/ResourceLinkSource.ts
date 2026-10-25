import type { ResourceLinkRouter } from "@/models/resource/link/ResourceLinkRouter";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// Where a link type's resources are listed from: the router that owns them, the mark they are drawn with, and what the
// Picker says while there is none to choose
export interface ResourceLinkSource {
  emptyMessage: string;
  // Whether the list offers only the published resources, which a bound one outside it is then flagged against
  isPublishedOnly?: true;
  meaning: UiIconMeaning;
  router: ResourceLinkRouter;
  // The id a link holds before one is bound, which names no resource and is shown as none
  unboundId: string;
}
