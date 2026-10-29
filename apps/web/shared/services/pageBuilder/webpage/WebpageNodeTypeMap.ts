import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";
import type { WebpageNode } from "#shared/models/pageBuilder/webpage/WebpageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { ButtonDefinition } from "#shared/services/pageBuilder/webpage/button/ButtonDefinition";
import { ColumnDefinition } from "#shared/services/pageBuilder/webpage/column/ColumnDefinition";
import { ColumnsDefinition } from "#shared/services/pageBuilder/webpage/columns/ColumnsDefinition";
import { CountdownDefinition } from "#shared/services/pageBuilder/webpage/countdown/CountdownDefinition";
import { CustomHtmlDefinition } from "#shared/services/pageBuilder/webpage/customHtml/CustomHtmlDefinition";
import { ImageDefinition } from "#shared/services/pageBuilder/webpage/image/ImageDefinition";
import { MapDefinition } from "#shared/services/pageBuilder/webpage/map/MapDefinition";
import { SectionDefinition } from "#shared/services/pageBuilder/webpage/section/SectionDefinition";
import { SurveyInviteDefinition } from "#shared/services/pageBuilder/webpage/surveyInvite/SurveyInviteDefinition";
import { TabDefinition } from "#shared/services/pageBuilder/webpage/tab/TabDefinition";
import { TabsDefinition } from "#shared/services/pageBuilder/webpage/tabs/TabsDefinition";
import { TextDefinition } from "#shared/services/pageBuilder/webpage/text/TextDefinition";
import { TooltipDefinition } from "#shared/services/pageBuilder/webpage/tooltip/TooltipDefinition";
import { TypedTextDefinition } from "#shared/services/pageBuilder/webpage/typedText/TypedTextDefinition";
import { VideoDefinition } from "#shared/services/pageBuilder/webpage/video/VideoDefinition";

export const WebpageNodeTypeMap = {
  [WebpageNodeType.Button]: ButtonDefinition,
  [WebpageNodeType.Column]: ColumnDefinition,
  [WebpageNodeType.Columns]: ColumnsDefinition,
  [WebpageNodeType.Countdown]: CountdownDefinition,
  [WebpageNodeType.CustomHtml]: CustomHtmlDefinition,
  [WebpageNodeType.Image]: ImageDefinition,
  [WebpageNodeType.Map]: MapDefinition,
  [WebpageNodeType.Section]: SectionDefinition,
  [WebpageNodeType.SurveyInvite]: SurveyInviteDefinition,
  [WebpageNodeType.Tab]: TabDefinition,
  [WebpageNodeType.Tabs]: TabsDefinition,
  [WebpageNodeType.Text]: TextDefinition,
  [WebpageNodeType.Tooltip]: TooltipDefinition,
  [WebpageNodeType.TypedText]: TypedTextDefinition,
  [WebpageNodeType.Video]: VideoDefinition,
} as const satisfies PageNodeDefinitionMap<WebpageNode>;
