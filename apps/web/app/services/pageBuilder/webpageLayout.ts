import type { PageBuilderLayout } from "@/models/pageBuilder/PageBuilderLayout";

import {
  PAGE_BUILDER_BASE_PANELS,
  PAGE_BUILDER_CANVAS_ID,
  PAGE_BUILDER_CONTENT_KEY_MAP,
  PAGE_BUILDER_PANEL_ID_MAP,
  PAGE_BUILDER_PANEL_NAME_MAP,
  PAGE_BUILDER_REGION_ID_MAP,
  PAGE_BUILDER_REGIONS,
  PAGE_BUILDER_SELECTION_KIND_MAP,
} from "@/services/pageBuilder/pageBuilderLayout";

// The webpage's arrangement on the shell. Its settings tabs follow the selection: with nothing selected the page's own settings
// And its theme, and with a node its content and its style for the device the toggle in the bar chose
export const webpageLayout: PageBuilderLayout = {
  layout: {
    canvasId: PAGE_BUILDER_CANVAS_ID,
    panels: [
      ...PAGE_BUILDER_BASE_PANELS,
      {
        condition: { selectionKinds: [PAGE_BUILDER_SELECTION_KIND_MAP.Nothing] },
        id: PAGE_BUILDER_PANEL_ID_MAP.Page,
        regionId: PAGE_BUILDER_REGION_ID_MAP.Inspector,
        selectionKindContentKeyMap: {},
        wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Content,
      },
      {
        condition: { selectionKinds: [PAGE_BUILDER_SELECTION_KIND_MAP.Nothing] },
        id: PAGE_BUILDER_PANEL_ID_MAP.Theme,
        regionId: PAGE_BUILDER_REGION_ID_MAP.Inspector,
        selectionKindContentKeyMap: {},
        wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Theme,
      },
      {
        condition: { selectionKinds: [PAGE_BUILDER_SELECTION_KIND_MAP.Node] },
        id: PAGE_BUILDER_PANEL_ID_MAP.Content,
        regionId: PAGE_BUILDER_REGION_ID_MAP.Inspector,
        selectionKindContentKeyMap: {},
        wildcardContentKey: PAGE_BUILDER_CONTENT_KEY_MAP.Content,
      },
      {
        condition: { selectionKinds: [PAGE_BUILDER_SELECTION_KIND_MAP.Node] },
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
    [PAGE_BUILDER_PANEL_ID_MAP.Page]: "Page",
    [PAGE_BUILDER_PANEL_ID_MAP.Theme]: "Theme",
  },
};
