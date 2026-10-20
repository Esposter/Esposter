import type { BlockChildren } from "headless-block-editor";
import type { MjmlNode } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { mjmlNodeChildren } from "mjml-blocks";

// The survey invite holds no slot; every other node is MJML's own, so its children come from MJML's port
export const emailNodeChildren: BlockChildren<MjmlNode> = (node) =>
  node.type === EmailNodeType.SurveyInvite ? {} : mjmlNodeChildren(node);
