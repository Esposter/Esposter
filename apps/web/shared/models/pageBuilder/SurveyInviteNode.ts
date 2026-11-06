import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A SurveyInvite node of a webpage: a link to one published survey
export type SurveyInviteNode = BlockNode<WebpageNodeType.SurveyInvite, SurveyInviteNodeProps>;
