import { z } from "zod";

export enum EmailNodeType {
  Button = "Button",
  Column = "Column",
  CustomHtml = "CustomHtml",
  Divider = "Divider",
  Hero = "Hero",
  Image = "Image",
  Navbar = "Navbar",
  NavbarLink = "NavbarLink",
  Section = "Section",
  Social = "Social",
  SocialElement = "SocialElement",
  Spacer = "Spacer",
  SurveyInvite = "SurveyInvite",
  Text = "Text",
  Wrapper = "Wrapper",
}

export const emailNodeTypeSchema = z.enum(EmailNodeType) satisfies z.ZodType<EmailNodeType>;

export const EmailNodeTypes = Object.values(EmailNodeType);
