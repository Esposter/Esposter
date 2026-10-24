import type { PageBuilderPaletteCategory } from "@/models/pageBuilder/PageBuilderPaletteCategory";
import type { MjmlNode } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
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
