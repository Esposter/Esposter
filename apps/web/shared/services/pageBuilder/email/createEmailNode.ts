import type { EmailNodeType as EmailNodeTypeName } from "#shared/models/pageBuilder/EmailNodeType";
import type { MjmlNode, MjmlNodeType as MjmlNodeTypeName } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { PLACEHOLDER_MEDIA_URL } from "#shared/services/pageBuilder/constants";
import { createSurveyInviteProps } from "#shared/services/pageBuilder/createSurveyInviteProps";
import { MjmlNodeType } from "mjml-blocks";

// The placeholder a freshly inserted link node points at until its author sets one. A relative target keeps an Email from
// Requesting any origin the reader did not choose
const PLACEHOLDER_HREF = "#";
// The empty body a freshly inserted text holds, which is the Note's own empty document
const EMPTY_RICH_TEXT = { content: [{ type: "paragraph" }], type: "doc" };

// The node a freshly inserted node of each email type is, under the id the caller mints for it: each the smallest props
// Its schema accepts, and each keyed by its type so the node it builds is the type it is keyed by
const emailNodeDefaultsMap: { [K in MjmlNode["type"]]: (id: string) => Extract<MjmlNode, { type: K }> } = {
  [EmailNodeType.SurveyInvite]: (id) => ({ props: createSurveyInviteProps(id), type: EmailNodeType.SurveyInvite }),
  [MjmlNodeType.Accordion]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Accordion }),
  [MjmlNodeType.AccordionElement]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.AccordionElement }),
  [MjmlNodeType.AccordionText]: (id) => ({ props: { content: EMPTY_RICH_TEXT, id }, type: MjmlNodeType.AccordionText }),
  [MjmlNodeType.AccordionTitle]: (id) => ({ props: { content: "Question", id }, type: MjmlNodeType.AccordionTitle }),
  [MjmlNodeType.Button]: (id) => ({
    props: { content: "Button", href: PLACEHOLDER_HREF, id },
    type: MjmlNodeType.Button,
  }),
  [MjmlNodeType.Carousel]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Carousel }),
  [MjmlNodeType.CarouselImage]: (id) => ({
    props: { alt: "Image", id, src: PLACEHOLDER_MEDIA_URL },
    type: MjmlNodeType.CarouselImage,
  }),
  [MjmlNodeType.Column]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Column }),
  [MjmlNodeType.Divider]: (id) => ({ props: { id }, type: MjmlNodeType.Divider }),
  [MjmlNodeType.Group]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Group }),
  [MjmlNodeType.Hero]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Hero }),
  [MjmlNodeType.Image]: (id) => ({ props: { alt: "Image", id, src: PLACEHOLDER_MEDIA_URL }, type: MjmlNodeType.Image }),
  [MjmlNodeType.Navbar]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Navbar }),
  [MjmlNodeType.NavbarLink]: (id) => ({
    props: { content: "Link", href: PLACEHOLDER_HREF, id },
    type: MjmlNodeType.NavbarLink,
  }),
  [MjmlNodeType.Raw]: (id) => ({ props: { content: "", id }, type: MjmlNodeType.Raw }),
  [MjmlNodeType.Section]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Section }),
  [MjmlNodeType.Social]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Social }),
  [MjmlNodeType.SocialElement]: (id) => ({
    props: { content: "Website", href: PLACEHOLDER_HREF, id, name: "web" },
    type: MjmlNodeType.SocialElement,
  }),
  [MjmlNodeType.Spacer]: (id) => ({ props: { id }, type: MjmlNodeType.Spacer }),
  [MjmlNodeType.Table]: (id) => ({ props: { content: "", id }, type: MjmlNodeType.Table }),
  [MjmlNodeType.Text]: (id) => ({ props: { content: EMPTY_RICH_TEXT, id }, type: MjmlNodeType.Text }),
  [MjmlNodeType.Wrapper]: (id) => ({ props: { children: [], id }, type: MjmlNodeType.Wrapper }),
};

// The node of the type a freshly inserted block is, under the id the caller mints for it
export const createEmailNode = (type: EmailNodeTypeName | MjmlNodeTypeName, id: string): MjmlNode =>
  emailNodeDefaultsMap[type](id);
