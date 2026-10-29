import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";

import { createPageNodeSchema } from "#shared/services/pageBuilder/createPageNodeSchema";
import { WebpageNodeTypeMap } from "#shared/services/pageBuilder/webpage/WebpageNodeTypeMap";
import { z } from "zod";

// Recursive through every slot, so a document parses whole in one pass
export const webpageNodeSchema: z.ZodType<WebpageNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    createPageNodeSchema(WebpageNodeTypeMap.Button, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Column, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Columns, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Countdown, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.CustomHtml, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Image, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Map, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Section, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.SurveyInvite, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Tab, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Tabs, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Text, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Tooltip, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.TypedText, webpageNodeSchema),
    createPageNodeSchema(WebpageNodeTypeMap.Video, webpageNodeSchema),
  ]),
);
