import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { CountdownNode } from "#shared/models/pageBuilder/CountdownNode";
import type { CustomHtmlNode } from "#shared/models/pageBuilder/CustomHtmlNode";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { NodeSlots } from "#shared/models/pageBuilder/NodeSlots";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";
import type { TypedTextNode } from "#shared/models/pageBuilder/TypedTextNode";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { columnNodeType } from "#shared/services/pageBuilder/columnNodeType";
import { columnsNodeType } from "#shared/services/pageBuilder/columnsNodeType";
import { countdownNodeType } from "#shared/services/pageBuilder/countdownNodeType";
import { customHtmlNodeType } from "#shared/services/pageBuilder/customHtmlNodeType";
import { imageNodeType } from "#shared/services/pageBuilder/imageNodeType";
import { sectionNodeType } from "#shared/services/pageBuilder/sectionNodeType";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { tabNodeType } from "#shared/services/pageBuilder/tabNodeType";
import { tabsNodeType } from "#shared/services/pageBuilder/tabsNodeType";
import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { tooltipNodeType } from "#shared/services/pageBuilder/tooltipNodeType";
import { typedTextNodeType } from "#shared/services/pageBuilder/typedTextNodeType";
import { videoNodeType } from "#shared/services/pageBuilder/videoNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// Calls a type's own render with the node and slots typed for that type, so the call takes no node of another type
const renderAs = <TNode extends WebpageNode>(
  definition: NodeTypeDefinition<TNode>,
  node: TNode,
  slots: NodeSlots<TNode>,
  context: RenderContext,
): HtmlNode => definition.render(node, slots, context);

// Renders one node by its type tag, with the definition of that type. The core hands each node its rendered slots by name,
// And a slot a node's type declares is always present, so a slot read falls back to nothing only for a type with no slot
export const renderWebpageNode = (
  node: WebpageNode,
  slots: Record<string, HtmlNode[]>,
  context: RenderContext,
): HtmlNode => {
  const children = slots.children ?? [];
  switch (node.type) {
    case WebpageNodeType.Button:
      return renderAs<ButtonNode>(buttonNodeType, node, {}, context);
    case WebpageNodeType.Column:
      return renderAs<ColumnNode>(columnNodeType, node, { children }, context);
    case WebpageNodeType.Columns:
      return renderAs<ColumnsNode>(columnsNodeType, node, { children }, context);
    case WebpageNodeType.Countdown:
      return renderAs<CountdownNode>(countdownNodeType, node, {}, context);
    case WebpageNodeType.CustomHtml:
      return renderAs<CustomHtmlNode>(customHtmlNodeType, node, {}, context);
    case WebpageNodeType.Image:
      return renderAs<ImageNode>(imageNodeType, node, {}, context);
    case WebpageNodeType.Section:
      return renderAs<SectionNode>(sectionNodeType, node, { children }, context);
    case WebpageNodeType.SurveyInvite:
      return renderAs<SurveyInviteNode>(surveyInviteNodeType, node, {}, context);
    case WebpageNodeType.Tab:
      return renderAs<TabNode>(tabNodeType, node, { children }, context);
    case WebpageNodeType.Tabs:
      return renderAs<TabsNode>(tabsNodeType, node, { children }, context);
    case WebpageNodeType.Text:
      return renderAs<TextNode>(textNodeType, node, {}, context);
    case WebpageNodeType.Tooltip:
      return renderAs<TooltipNode>(tooltipNodeType, node, {}, context);
    case WebpageNodeType.TypedText:
      return renderAs<TypedTextNode>(typedTextNodeType, node, {}, context);
    case WebpageNodeType.Video:
      return renderAs<VideoNode>(videoNodeType, node, {}, context);
    default:
      return exhaustiveGuard(node);
  }
};
