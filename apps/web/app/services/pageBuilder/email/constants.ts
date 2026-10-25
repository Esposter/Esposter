import type { PageBuilderPaletteCategory } from "@/models/pageBuilder/PageBuilderPaletteCategory";
import type { MjmlNode } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MjmlNodeType } from "mjml-blocks";

// The groups the email palette lists its node types in, in the order shown. A block is inserted into the first slot that
// Accepts it, so the groups name what a reader can add and not where it goes
export const EMAIL_PALETTE_CATEGORIES: readonly PageBuilderPaletteCategory<MjmlNode>[] = Object.freeze([
  Object.freeze({
    category: "Layout",
    types: Object.freeze([
      MjmlNodeType.Section,
      MjmlNodeType.Column,
      MjmlNodeType.Group,
      MjmlNodeType.Wrapper,
      MjmlNodeType.Hero,
    ]),
  }),
  Object.freeze({
    category: "Content",
    types: Object.freeze([
      MjmlNodeType.Text,
      MjmlNodeType.Button,
      MjmlNodeType.Image,
      MjmlNodeType.Divider,
      MjmlNodeType.Spacer,
      MjmlNodeType.Table,
      MjmlNodeType.Social,
      MjmlNodeType.Navbar,
      MjmlNodeType.Accordion,
      MjmlNodeType.Carousel,
      MjmlNodeType.Raw,
      EmailNodeType.SurveyInvite,
    ]),
  }),
]);
// The icon each email node type is drawn by in the palette, by the meaning it stands for, so each block reads at a glance
export const EMAIL_NODE_TYPE_ICON_MAP: Readonly<Record<EmailNodeType | MjmlNodeType, UiIconMeaning>> = Object.freeze({
  [EmailNodeType.SurveyInvite]: UiIconMeaning.Survey,
  [MjmlNodeType.Accordion]: UiIconMeaning.Disclosure,
  [MjmlNodeType.AccordionElement]: UiIconMeaning.Disclosure,
  [MjmlNodeType.AccordionText]: UiIconMeaning.ReadableText,
  [MjmlNodeType.AccordionTitle]: UiIconMeaning.Summary,
  [MjmlNodeType.Button]: UiIconMeaning.Button,
  [MjmlNodeType.Carousel]: UiIconMeaning.Carousel,
  [MjmlNodeType.CarouselImage]: UiIconMeaning.Image,
  [MjmlNodeType.Column]: UiIconMeaning.Columns,
  [MjmlNodeType.Divider]: UiIconMeaning.Divider,
  [MjmlNodeType.Group]: UiIconMeaning.Group,
  [MjmlNodeType.Hero]: UiIconMeaning.Banner,
  [MjmlNodeType.Image]: UiIconMeaning.Image,
  [MjmlNodeType.Navbar]: UiIconMeaning.Menu,
  [MjmlNodeType.NavbarLink]: UiIconMeaning.Link,
  [MjmlNodeType.Raw]: UiIconMeaning.Terminal,
  [MjmlNodeType.Section]: UiIconMeaning.Section,
  [MjmlNodeType.Social]: UiIconMeaning.Share,
  [MjmlNodeType.SocialElement]: UiIconMeaning.Share,
  [MjmlNodeType.Spacer]: UiIconMeaning.Spacer,
  [MjmlNodeType.Table]: UiIconMeaning.Sheet,
  [MjmlNodeType.Text]: UiIconMeaning.ReadableText,
  [MjmlNodeType.Wrapper]: UiIconMeaning.Rows,
});
