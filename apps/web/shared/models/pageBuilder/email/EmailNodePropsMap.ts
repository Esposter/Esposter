import type { EmailButtonProps } from "#shared/models/pageBuilder/email/EmailButtonProps";
import type { EmailColumnProps } from "#shared/models/pageBuilder/email/EmailColumnProps";
import type { EmailCustomHtmlProps } from "#shared/models/pageBuilder/email/EmailCustomHtmlProps";
import type { EmailDividerProps } from "#shared/models/pageBuilder/email/EmailDividerProps";
import type { EmailHeroProps } from "#shared/models/pageBuilder/email/EmailHeroProps";
import type { EmailImageProps } from "#shared/models/pageBuilder/email/EmailImageProps";
import type { EmailNavbarLinkProps } from "#shared/models/pageBuilder/email/EmailNavbarLinkProps";
import type { EmailNavbarProps } from "#shared/models/pageBuilder/email/EmailNavbarProps";
import type { EmailSectionProps } from "#shared/models/pageBuilder/email/EmailSectionProps";
import type { EmailSocialElementProps } from "#shared/models/pageBuilder/email/EmailSocialElementProps";
import type { EmailSocialProps } from "#shared/models/pageBuilder/email/EmailSocialProps";
import type { EmailSpacerProps } from "#shared/models/pageBuilder/email/EmailSpacerProps";
import type { EmailSurveyInviteProps } from "#shared/models/pageBuilder/email/EmailSurveyInviteProps";
import type { EmailTextProps } from "#shared/models/pageBuilder/email/EmailTextProps";
import type { EmailWrapperProps } from "#shared/models/pageBuilder/email/EmailWrapperProps";
import type { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";

// The one place an email type is tied to its props, which the node union and the registry both read
export interface EmailNodePropsMap {
  [EmailNodeType.Button]: EmailButtonProps;
  [EmailNodeType.Column]: EmailColumnProps;
  [EmailNodeType.CustomHtml]: EmailCustomHtmlProps;
  [EmailNodeType.Divider]: EmailDividerProps;
  [EmailNodeType.Hero]: EmailHeroProps;
  [EmailNodeType.Image]: EmailImageProps;
  [EmailNodeType.Navbar]: EmailNavbarProps;
  [EmailNodeType.NavbarLink]: EmailNavbarLinkProps;
  [EmailNodeType.Section]: EmailSectionProps;
  [EmailNodeType.Social]: EmailSocialProps;
  [EmailNodeType.SocialElement]: EmailSocialElementProps;
  [EmailNodeType.Spacer]: EmailSpacerProps;
  [EmailNodeType.SurveyInvite]: EmailSurveyInviteProps;
  [EmailNodeType.Text]: EmailTextProps;
  [EmailNodeType.Wrapper]: EmailWrapperProps;
}
