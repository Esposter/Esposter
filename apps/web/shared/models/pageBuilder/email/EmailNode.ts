import type { EmailNodePropsMap } from "#shared/models/pageBuilder/email/EmailNodePropsMap";
import type { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";

export type EmailNode = { [TType in EmailNodeType]: PageNode<TType, EmailNodePropsMap[TType]> }[EmailNodeType];
