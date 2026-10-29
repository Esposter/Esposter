import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { mapPropsSchema } from "#shared/models/pageBuilder/webpage/MapProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { DEFAULT_MAP_ZOOM, MAP_CLASS, MAP_CSS } from "#shared/services/pageBuilder/webpage/map/constants";
import { getMapEmbedUrl } from "#shared/services/pageBuilder/webpage/map/getMapEmbedUrl";

export const MapDefinition = {
  createProps: () => ({ address: "", style: {}, title: "Map", zoom: DEFAULT_MAP_ZOOM }),
  createPropsSchema: () => mapPropsSchema,
  css: MAP_CSS,
  render: ({ address, title, zoom }) =>
    createElement(ElementTag.InlineFrame, {
      [ElementAttribute.Class]: MAP_CLASS,
      [ElementAttribute.Loading]: "lazy",
      [ElementAttribute.ReferrerPolicy]: "no-referrer-when-downgrade",
      [ElementAttribute.Src]: getMapEmbedUrl(address, zoom),
      [ElementAttribute.Title]: title,
    }),
  slots: {},
  type: WebpageNodeType.Map,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Map>;
