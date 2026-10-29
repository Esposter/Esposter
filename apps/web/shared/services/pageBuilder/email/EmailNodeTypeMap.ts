import type { EmailNode } from "#shared/models/pageBuilder/email/EmailNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { EmailButtonDefinition } from "#shared/services/pageBuilder/email/button/EmailButtonDefinition";
import { EmailColumnDefinition } from "#shared/services/pageBuilder/email/column/EmailColumnDefinition";
import { EmailCustomHtmlDefinition } from "#shared/services/pageBuilder/email/customHtml/EmailCustomHtmlDefinition";
import { EmailDividerDefinition } from "#shared/services/pageBuilder/email/divider/EmailDividerDefinition";
import { EmailHeroDefinition } from "#shared/services/pageBuilder/email/hero/EmailHeroDefinition";
import { EmailImageDefinition } from "#shared/services/pageBuilder/email/image/EmailImageDefinition";
import { EmailNavbarDefinition } from "#shared/services/pageBuilder/email/navbar/EmailNavbarDefinition";
import { EmailNavbarLinkDefinition } from "#shared/services/pageBuilder/email/navbarLink/EmailNavbarLinkDefinition";
import { EmailSectionDefinition } from "#shared/services/pageBuilder/email/section/EmailSectionDefinition";
import { EmailSocialDefinition } from "#shared/services/pageBuilder/email/social/EmailSocialDefinition";
import { EmailSocialElementDefinition } from "#shared/services/pageBuilder/email/socialElement/EmailSocialElementDefinition";
import { EmailSpacerDefinition } from "#shared/services/pageBuilder/email/spacer/EmailSpacerDefinition";
import { EmailSurveyInviteDefinition } from "#shared/services/pageBuilder/email/surveyInvite/EmailSurveyInviteDefinition";
import { EmailTextDefinition } from "#shared/services/pageBuilder/email/text/EmailTextDefinition";
import { EmailWrapperDefinition } from "#shared/services/pageBuilder/email/wrapper/EmailWrapperDefinition";

export const EmailNodeTypeMap = {
  [EmailNodeType.Button]: EmailButtonDefinition,
  [EmailNodeType.Column]: EmailColumnDefinition,
  [EmailNodeType.CustomHtml]: EmailCustomHtmlDefinition,
  [EmailNodeType.Divider]: EmailDividerDefinition,
  [EmailNodeType.Hero]: EmailHeroDefinition,
  [EmailNodeType.Image]: EmailImageDefinition,
  [EmailNodeType.Navbar]: EmailNavbarDefinition,
  [EmailNodeType.NavbarLink]: EmailNavbarLinkDefinition,
  [EmailNodeType.Section]: EmailSectionDefinition,
  [EmailNodeType.Social]: EmailSocialDefinition,
  [EmailNodeType.SocialElement]: EmailSocialElementDefinition,
  [EmailNodeType.Spacer]: EmailSpacerDefinition,
  [EmailNodeType.SurveyInvite]: EmailSurveyInviteDefinition,
  [EmailNodeType.Text]: EmailTextDefinition,
  [EmailNodeType.Wrapper]: EmailWrapperDefinition,
} as const satisfies PageNodeDefinitionMap<EmailNode>;
