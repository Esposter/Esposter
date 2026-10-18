import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

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

// Every webpage type's shared half, keyed by its type, so a type missing from either half fails the typecheck
export const webpageNodeTypeDefinitionMap: Record<WebpageNodeType, NodeTypeDefinition> = {
  [WebpageNodeType.Button]: buttonNodeType,
  [WebpageNodeType.Column]: columnNodeType,
  [WebpageNodeType.Columns]: columnsNodeType,
  [WebpageNodeType.Countdown]: countdownNodeType,
  [WebpageNodeType.CustomHtml]: customHtmlNodeType,
  [WebpageNodeType.Image]: imageNodeType,
  [WebpageNodeType.Section]: sectionNodeType,
  [WebpageNodeType.SurveyInvite]: surveyInviteNodeType,
  [WebpageNodeType.Tab]: tabNodeType,
  [WebpageNodeType.Tabs]: tabsNodeType,
  [WebpageNodeType.Text]: textNodeType,
  [WebpageNodeType.Tooltip]: tooltipNodeType,
  [WebpageNodeType.TypedText]: typedTextNodeType,
  [WebpageNodeType.Video]: videoNodeType,
};
