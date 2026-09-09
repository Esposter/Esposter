import type { ResourceActivityEntity } from "@esposter/db-schema";

import { ResourceActivityType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
// The one-line detail under each entry — "" when the type carries no payload worth spelling out
export const getResourceActivityDetail = ({
  activityType,
  newName,
  oldName,
  publishVersion,
}: ResourceActivityEntity): string => {
  switch (activityType) {
    case ResourceActivityType.ContentSaved:
    case ResourceActivityType.Created:
    case ResourceActivityType.Duplicated:
    case ResourceActivityType.Restored:
    case ResourceActivityType.Unpublished:
      return "";
    case ResourceActivityType.Published:
      return publishVersion ? `v${publishVersion}` : "";
    case ResourceActivityType.Renamed:
      return oldName && newName ? `"${oldName}" → "${newName}"` : "";
    default:
      return exhaustiveGuard(activityType);
  }
};
