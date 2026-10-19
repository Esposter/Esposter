import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props a SurveyInvite node holds: the link's text, the published survey it links to and the style it is drawn with
export interface SurveyInviteNodeProps extends BlockNodeProps {
  label: string;
  style?: NodeStyle;
  surveyId: string;
}
