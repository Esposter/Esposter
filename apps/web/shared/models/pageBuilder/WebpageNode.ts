import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { CountdownNode } from "#shared/models/pageBuilder/CountdownNode";
import type { CustomHtmlNode } from "#shared/models/pageBuilder/CustomHtmlNode";
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";
import type { TypedTextNode } from "#shared/models/pageBuilder/TypedTextNode";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";

// Any node a webpage holds, of whichever of its types, narrowed by its type tag
export type WebpageNode =
  | ButtonNode
  | ColumnNode
  | ColumnsNode
  | CountdownNode
  | CustomHtmlNode
  | ImageNode
  | SectionNode
  | SurveyInviteNode
  | TabNode
  | TabsNode
  | TextNode
  | TooltipNode
  | TypedTextNode
  | VideoNode;
