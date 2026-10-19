import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { CountdownNode } from "#shared/models/pageBuilder/CountdownNode";
import type { CustomHtmlNode } from "#shared/models/pageBuilder/CustomHtmlNode";
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";
import type { TypedTextNode } from "#shared/models/pageBuilder/TypedTextNode";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";

// Every node a webpage slot may hold but a Column, which only Columns holds, and a Tab, which only Tabs holds
export type WebpagePlaceableNode =
  | ButtonNode
  | ColumnsNode
  | CountdownNode
  | CustomHtmlNode
  | ImageNode
  | SectionNode
  | SurveyInviteNode
  | TabsNode
  | TextNode
  | TooltipNode
  | TypedTextNode
  | VideoNode;
