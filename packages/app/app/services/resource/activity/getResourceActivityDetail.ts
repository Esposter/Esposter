import type { ResourceActivityEntity } from "@esposter/db-schema";

import { ResourceActivityType } from "@esposter/db-schema";
// The one-line detail under each entry — "" when the type carries no payload worth spelling out
export const getResourceActivityDetail = ({
  activityType,
  format,
  newName,
  oldName,
  publishVersion,
}: ResourceActivityEntity): string => {
  switch (activityType) {
    case ResourceActivityType.Imported:
      return format ? `from ${format}` : "";
    case ResourceActivityType.Published:
      return publishVersion ? `v${publishVersion}` : "";
    case ResourceActivityType.Renamed:
      return oldName && newName ? `"${oldName}" → "${newName}"` : "";
    default:
      return "";
  }
};
