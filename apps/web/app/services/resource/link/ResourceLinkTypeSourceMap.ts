import type { ResourceLinkSource } from "@/models/resource/link/ResourceLinkSource";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NO_SURVEY_ID } from "#shared/services/pageBuilder/constants";
import { ResourceLinkType } from "@esposter/db-schema";

// The source of each link type a schema form can draw. A survey's list is its published surveys alone, since a survey
// that is not published answers its invite with not-found. A dataset link names a source of any provider type, so no
// One router lists it, and it stays a plain field
export const ResourceLinkTypeSourceMap: Partial<Record<ResourceLinkType, ResourceLinkSource>> = {
  [ResourceLinkType.Email]: {
    emptyMessage: "There is no email to choose yet",
    meaning: UiIconMeaning.Email,
    router: "email",
    unboundId: "",
  },
  [ResourceLinkType.Survey]: {
    emptyMessage: "A survey must be published before it can be chosen",
    isPublishedOnly: true,
    meaning: UiIconMeaning.Survey,
    router: "survey",
    unboundId: NO_SURVEY_ID,
  },
};
