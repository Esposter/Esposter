import type { ButtonProps } from "#shared/models/pageBuilder/webpage/ButtonProps";
import type { ColumnProps } from "#shared/models/pageBuilder/webpage/ColumnProps";
import type { ColumnsProps } from "#shared/models/pageBuilder/webpage/ColumnsProps";
import type { CountdownProps } from "#shared/models/pageBuilder/webpage/CountdownProps";
import type { CustomHtmlProps } from "#shared/models/pageBuilder/webpage/CustomHtmlProps";
import type { ImageProps } from "#shared/models/pageBuilder/webpage/ImageProps";
import type { MapProps } from "#shared/models/pageBuilder/webpage/MapProps";
import type { SectionProps } from "#shared/models/pageBuilder/webpage/SectionProps";
import type { SurveyInviteProps } from "#shared/models/pageBuilder/webpage/SurveyInviteProps";
import type { TabProps } from "#shared/models/pageBuilder/webpage/TabProps";
import type { TabsProps } from "#shared/models/pageBuilder/webpage/TabsProps";
import type { TextProps } from "#shared/models/pageBuilder/webpage/TextProps";
import type { TooltipProps } from "#shared/models/pageBuilder/webpage/TooltipProps";
import type { TypedTextProps } from "#shared/models/pageBuilder/webpage/TypedTextProps";
import type { VideoProps } from "#shared/models/pageBuilder/webpage/VideoProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";

export interface WebpageNodePropsMap {
  [WebpageNodeType.Button]: ButtonProps;
  [WebpageNodeType.Column]: ColumnProps;
  [WebpageNodeType.Columns]: ColumnsProps;
  [WebpageNodeType.Countdown]: CountdownProps;
  [WebpageNodeType.CustomHtml]: CustomHtmlProps;
  [WebpageNodeType.Image]: ImageProps;
  [WebpageNodeType.Map]: MapProps;
  [WebpageNodeType.Section]: SectionProps;
  [WebpageNodeType.SurveyInvite]: SurveyInviteProps;
  [WebpageNodeType.Tab]: TabProps;
  [WebpageNodeType.Tabs]: TabsProps;
  [WebpageNodeType.Text]: TextProps;
  [WebpageNodeType.Tooltip]: TooltipProps;
  [WebpageNodeType.TypedText]: TypedTextProps;
  [WebpageNodeType.Video]: VideoProps;
}
