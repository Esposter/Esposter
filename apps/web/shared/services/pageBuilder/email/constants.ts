import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { MjmlNodeType } from "mjml-blocks";

// The most nodes an email may hold, counted across every slot, so a document cannot grow past what a render walks
export const MAX_EMAIL_NODES = 1000;

// The width below which MJML stacks a section's columns. Its mobile media query is the breakpoint less one pixel
// (mjml-core's makeLowerBreakpoint), so a canvas exactly 480 pixels wide still lays its columns side by side
export const EMAIL_MOBILE_BREAKPOINT = 480;

// The title each email node type is shown by: MJML's own components and the one type an email adds to them
export const EMAIL_NODE_TYPE_TITLE_MAP: Readonly<Record<EmailNodeType | MjmlNodeType, string>> = Object.freeze({
  [EmailNodeType.SurveyInvite]: "Survey invite",
  [MjmlNodeType.Accordion]: "Accordion",
  [MjmlNodeType.AccordionElement]: "Accordion element",
  [MjmlNodeType.AccordionText]: "Accordion text",
  [MjmlNodeType.AccordionTitle]: "Accordion title",
  [MjmlNodeType.Button]: "Button",
  [MjmlNodeType.Carousel]: "Carousel",
  [MjmlNodeType.CarouselImage]: "Carousel image",
  [MjmlNodeType.Column]: "Column",
  [MjmlNodeType.Divider]: "Divider",
  [MjmlNodeType.Group]: "Group",
  [MjmlNodeType.Hero]: "Hero",
  [MjmlNodeType.Image]: "Image",
  [MjmlNodeType.Navbar]: "Navbar",
  [MjmlNodeType.NavbarLink]: "Navbar link",
  [MjmlNodeType.Raw]: "Raw HTML",
  [MjmlNodeType.Section]: "Section",
  [MjmlNodeType.Social]: "Social links",
  [MjmlNodeType.SocialElement]: "Social link",
  [MjmlNodeType.Spacer]: "Spacer",
  [MjmlNodeType.Table]: "Table",
  [MjmlNodeType.Text]: "Text",
  [MjmlNodeType.Wrapper]: "Wrapper",
});
