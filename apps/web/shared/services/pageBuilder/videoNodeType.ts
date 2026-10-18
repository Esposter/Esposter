import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

// An uploaded video with no default source, so a video is never a file the app does not serve
const videoFormSchema = z.strictObject({ src: webpageUrlSchema, title: z.string().min(1) });
const videoPropsSchema = z.strictObject({ ...videoFormSchema.shape, id: z.string() });

export const videoNodeType = {
  css: ".video { max-width: 100%; }",
  formSchema: videoFormSchema,
  propsSchema: videoPropsSchema,
  // The title is the video's accessible name, since a video has no alternative text of its own
  render: (node) => {
    const { src, title } = videoPropsSchema.parse(node.props);
    return {
      attributes: { "aria-label": title, class: "video", controls: "", preload: "metadata", src, title },
      children: [],
      tag: "video",
    };
  },
  slots: {},
  type: WebpageNodeType.Video,
} satisfies NodeTypeDefinition;
