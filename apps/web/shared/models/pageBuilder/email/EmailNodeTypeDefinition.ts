import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { EmailNodePropsMap } from "#shared/models/pageBuilder/email/EmailNodePropsMap";
import type { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

export type EmailNodeTypeDefinition<TType extends EmailNodeType> = NodeTypeDefinition<
  EmailNode,
  TType,
  EmailNodePropsMap[TType]
>;
