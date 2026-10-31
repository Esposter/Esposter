import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";
import type { VideoNodeProps } from "#shared/models/pageBuilder/VideoNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

// An uploaded video with no default source, so a new video never points at a file its author did not choose
const videoFormSchema = z.strictObject({ src: webpageUrlSchema, title: nodeTextSchema });
const videoPropsSchema = z.object({ ...videoFormSchema.shape, style: nodeStyleSchema.optional() }) satisfies z.ZodType<
  OwnProps<VideoNodeProps>
>;

export const videoNodeType = {
  css: ".video { max-width: 100%; }",
  formSchema: videoFormSchema,
  isFocusable: false,
  propsSchema: videoPropsSchema,
  // The title is the video's accessible name, since a video has no alternative text of its own
  render: (node) => ({
    attributes: {
      [HtmlAttributeName.AriaLabel]: node.props.title,
      [HtmlAttributeName.Class]: "video",
      [HtmlAttributeName.Controls]: "",
      [HtmlAttributeName.Preload]: "metadata",
      [HtmlAttributeName.Src]: node.props.src,
      [HtmlAttributeName.Title]: node.props.title,
    },
    children: [],
    tag: HtmlTag.Video,
  }),
  slots: {},
  type: WebpageNodeType.Video,
} satisfies NodeTypeDefinition<VideoNode>;
