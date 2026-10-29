import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { videoPropsSchema } from "#shared/models/pageBuilder/webpage/VideoProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { toBooleanAttribute } from "#shared/services/pageBuilder/html/toBooleanAttribute";

export const VideoDefinition = {
  createProps: () => ({ isAutoplay: false, isLoop: false, isMuted: false, poster: "", src: "", style: {} }),
  createPropsSchema: () => videoPropsSchema,
  render: ({ isAutoplay, isLoop, isMuted, poster, src }) =>
    createElement(ElementTag.Video, {
      [ElementAttribute.Autoplay]: toBooleanAttribute(isAutoplay),
      [ElementAttribute.Controls]: toBooleanAttribute(true),
      [ElementAttribute.Loop]: toBooleanAttribute(isLoop),
      // A browser only starts a video by itself when it is muted
      [ElementAttribute.Muted]: toBooleanAttribute(isMuted || isAutoplay),
      [ElementAttribute.PlaysInline]: toBooleanAttribute(true),
      [ElementAttribute.Poster]: poster || undefined,
      [ElementAttribute.Preload]: "metadata",
      [ElementAttribute.Src]: src || undefined,
    }),
  slots: {},
  type: WebpageNodeType.Video,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Video>;
