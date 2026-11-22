import type { PageLink } from "#shared/models/app/PageLink";
import type { UiCommand } from "#src/models/ui/UiCommand";

import { PLACES_COMMAND_GROUP, UNAVAILABLE_PAGE_LABEL } from "#src/services/app/constants";
import { getPageIcon } from "#src/services/app/getPageIcon";
import { getPageLabel } from "#src/services/app/getPageLabel";

// A place as the palette lists it: a page to go to, or one that cannot be reached, listed muted with nothing to go to
export const getPlaceCommand = ({ mark, path, title }: PageLink, isAvailable: boolean): UiCommand => {
  const pageIcon = getPageIcon({ mark, path });
  return {
    group: PLACES_COMMAND_GROUP,
    id: `${PLACES_COMMAND_GROUP}${path}`,
    title: getPageLabel(path, title),
    ...(isAvailable ? { to: path } : { description: UNAVAILABLE_PAGE_LABEL, isDisabled: true }),
    ...(pageIcon ?? { image: "" }),
  };
};
