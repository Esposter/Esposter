import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";

// MJML's own font stack, the default of every component that sets a font
export const MJML_FONT_FAMILY = "Ubuntu, Helvetica, Arial, sans-serif";
// MJML's padding around a leaf in its column
export const MJML_LEAF_PADDING = "10px 25px";
export const MAX_EMAIL_ATTRIBUTE_LENGTH = 256;
// An attribute value is empty when unset, so MJML applies its own default. None may hold a double quote or an angle
// Bracket, since MJML writes the values it is given into the attributes and styles of the HTML it emits
export const EMAIL_COLOR_REGEX = /^(?:#(?:[\da-f]{3}){1,2}|rgba?\([\d\s,.]+\)|[a-z]+)?$/iu;
export const EMAIL_LENGTH_REGEX = /^(?:\d+(?:\.\d+)?(?:px|%)?)?$/u;
export const EMAIL_PADDING_REGEX = /^(?:\d+(?:\.\d+)?(?:px|%)?(?: \d+(?:\.\d+)?(?:px|%)?){0,3})?$/u;
export const EMAIL_FONT_FAMILY_REGEX = /^[\w\s,'-]*$/u;
export const EMAIL_BORDER_REGEX = /^[\w\s#%.,()-]*$/u;
// What a column or a hero may hold: every leaf
export const EMAIL_LEAF_NODE_TYPES = [
  EmailNodeType.Button,
  EmailNodeType.CustomHtml,
  EmailNodeType.Divider,
  EmailNodeType.Image,
  EmailNodeType.Navbar,
  EmailNodeType.Social,
  EmailNodeType.Spacer,
  EmailNodeType.SurveyInvite,
  EmailNodeType.Text,
];
// What the body may hold, and a wrapper all of it but raw HTML
export const EMAIL_BODY_NODE_TYPES = [
  EmailNodeType.CustomHtml,
  EmailNodeType.Hero,
  EmailNodeType.Section,
  EmailNodeType.Wrapper,
];
