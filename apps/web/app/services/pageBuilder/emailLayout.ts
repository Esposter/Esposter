import type { PageBuilderLayout } from "@/models/pageBuilder/PageBuilderLayout";

import {
  PAGE_BUILDER_BASE_PANELS,
  PAGE_BUILDER_CANVAS_ID,
  PAGE_BUILDER_CONTENT_KEY_MAP,
  PAGE_BUILDER_PANEL_ID_MAP,
  PAGE_BUILDER_PANEL_NAME_MAP,
  PAGE_BUILDER_REGION_ID_MAP,
  PAGE_BUILDER_REGIONS,
} from "@/services/pageBuilder/pageBuilderLayout";

// The email's arrangement on the shell as the page builder drew it before: its content and style for the selection, with no
// Theme and no check, since an email has neither. Its own change adds what the email shows that the webpage does not
export const emailLayout: PageBuilderLayout = {
  layout: {
    canvasId: PAGE_BUILDER_CANVAS_ID,
    panels: [
      ...PAGE_BUILDER_BASE_PANELS,
      {
        condition: {},
        id: PAGE_BUILDER_PANEL_ID_MAP.Content,
        regionId: PAGE_BUILDER_REGION_ID_MAP.Inspector,
        selectionKindContentKeyMap: {},
        wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Content,
      },
      {
        condition: {},
        id: PAGE_BUILDER_PANEL_ID_MAP.Style,
        regionId: PAGE_BUILDER_REGION_ID_MAP.Inspector,
        selectionKindContentKeyMap: {},
        wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Style,
      },
    ],
    regions: PAGE_BUILDER_REGIONS,
  },
  panelNameMap: {
    ...PAGE_BUILDER_PANEL_NAME_MAP,
    [PAGE_BUILDER_PANEL_ID_MAP.Content]: "Content",
    [PAGE_BUILDER_PANEL_ID_MAP.Style]: "Style",
  },
};
