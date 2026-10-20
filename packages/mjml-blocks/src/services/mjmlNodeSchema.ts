import type { CreateMjmlNodeSchemaOptions } from "#src/models/CreateMjmlNodeSchemaOptions";
import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { MjmlCarouselNode } from "#src/models/MjmlCarouselNode";
import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlTableNode } from "#src/models/MjmlTableNode";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";
import type { MjmlWrapperNode } from "#src/models/MjmlWrapperNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { accordionPropsSchema } from "#src/services/components/mjAccordion";
import { accordionElementPropsSchema } from "#src/services/components/mjAccordionElement";
import { createMjmlAccordionTextPropsSchema } from "#src/services/components/mjAccordionText";
import { accordionTitlePropsSchema } from "#src/services/components/mjAccordionTitle";
import { buttonPropsSchema } from "#src/services/components/mjButton";
import { carouselPropsSchema } from "#src/services/components/mjCarousel";
import { carouselImagePropsSchema } from "#src/services/components/mjCarouselImage";
import { columnPropsSchema } from "#src/services/components/mjColumn";
import { dividerPropsSchema } from "#src/services/components/mjDivider";
import { groupPropsSchema } from "#src/services/components/mjGroup";
import { heroPropsSchema } from "#src/services/components/mjHero";
import { imagePropsSchema } from "#src/services/components/mjImage";
import { navbarPropsSchema } from "#src/services/components/mjNavbar";
import { navbarLinkPropsSchema } from "#src/services/components/mjNavbarLink";
import { rawPropsSchema } from "#src/services/components/mjRaw";
import { sectionPropsSchema } from "#src/services/components/mjSection";
import { socialPropsSchema } from "#src/services/components/mjSocial";
import { socialElementPropsSchema } from "#src/services/components/mjSocialElement";
import { spacerPropsSchema } from "#src/services/components/mjSpacer";
import { tablePropsSchema } from "#src/services/components/mjTable";
import { createMjmlTextPropsSchema } from "#src/services/components/mjText";
import { wrapperPropsSchema } from "#src/services/components/mjWrapper";
import { createMjmlNodeBranch } from "#src/services/createMjmlNodeBranch";
import { createMjmlSlotSchema } from "#src/services/createMjmlSlotSchema";
import { z } from "zod";

// The email's node schema: one static branch per MJML node type, each satisfying its node interface, and each slot's accepted types a static union over their branches
// Nothing is built from the registry at runtime, so the compiler checks every branch and the union satisfies the node union. The MJML node graph has no cycle, so each branch is defined after the branches it holds
// The consumer's leaf node and rich text are passed in, since a leaf is named only by the consumer and a text's content is read by its rich text's schema
export const createMjmlNodeSchema = <TContent extends MjmlRichText>({
  leafNodeSchema,
  richText,
}: CreateMjmlNodeSchemaOptions<TContent>): z.ZodType<MjmlNode> => {
  const textNode = createMjmlNodeBranch(
    MjmlNodeType.Text,
    createMjmlTextPropsSchema(richText),
    {},
  ) satisfies z.ZodType<MjmlTextNode>;
  const rawNode = createMjmlNodeBranch(MjmlNodeType.Raw, rawPropsSchema, {}) satisfies z.ZodType<MjmlRawNode>;
  const accordionTitleNode = createMjmlNodeBranch(
    MjmlNodeType.AccordionTitle,
    accordionTitlePropsSchema,
    {},
  ) satisfies z.ZodType<MjmlAccordionTitleNode>;
  const accordionTextNode = createMjmlNodeBranch(
    MjmlNodeType.AccordionText,
    createMjmlAccordionTextPropsSchema(richText),
    {},
  ) satisfies z.ZodType<MjmlAccordionTextNode>;
  const accordionElementNode = createMjmlNodeBranch(MjmlNodeType.AccordionElement, accordionElementPropsSchema, {
    children: z.array(createMjmlSlotSchema([accordionTitleNode, accordionTextNode, rawNode])),
  }) satisfies z.ZodType<MjmlAccordionElementNode>;
  const accordionNode = createMjmlNodeBranch(MjmlNodeType.Accordion, accordionPropsSchema, {
    children: z.array(createMjmlSlotSchema([accordionElementNode, rawNode])),
  }) satisfies z.ZodType<MjmlAccordionNode>;
  const buttonNode = createMjmlNodeBranch(
    MjmlNodeType.Button,
    buttonPropsSchema,
    {},
  ) satisfies z.ZodType<MjmlButtonNode>;
  const carouselImageNode = createMjmlNodeBranch(
    MjmlNodeType.CarouselImage,
    carouselImagePropsSchema,
    {},
  ) satisfies z.ZodType<MjmlCarouselImageNode>;
  const carouselNode = createMjmlNodeBranch(MjmlNodeType.Carousel, carouselPropsSchema, {
    children: z.array(createMjmlSlotSchema([carouselImageNode])),
  }) satisfies z.ZodType<MjmlCarouselNode>;
  const dividerNode = createMjmlNodeBranch(
    MjmlNodeType.Divider,
    dividerPropsSchema,
    {},
  ) satisfies z.ZodType<MjmlDividerNode>;
  const imageNode = createMjmlNodeBranch(MjmlNodeType.Image, imagePropsSchema, {}) satisfies z.ZodType<MjmlImageNode>;
  const navbarLinkNode = createMjmlNodeBranch(
    MjmlNodeType.NavbarLink,
    navbarLinkPropsSchema,
    {},
  ) satisfies z.ZodType<MjmlNavbarLinkNode>;
  const navbarNode = createMjmlNodeBranch(MjmlNodeType.Navbar, navbarPropsSchema, {
    children: z.array(createMjmlSlotSchema([navbarLinkNode, rawNode])),
  }) satisfies z.ZodType<MjmlNavbarNode>;
  const socialElementNode = createMjmlNodeBranch(
    MjmlNodeType.SocialElement,
    socialElementPropsSchema,
    {},
  ) satisfies z.ZodType<MjmlSocialElementNode>;
  const socialNode = createMjmlNodeBranch(MjmlNodeType.Social, socialPropsSchema, {
    children: z.array(createMjmlSlotSchema([socialElementNode, rawNode])),
  }) satisfies z.ZodType<MjmlSocialNode>;
  const spacerNode = createMjmlNodeBranch(
    MjmlNodeType.Spacer,
    spacerPropsSchema,
    {},
  ) satisfies z.ZodType<MjmlSpacerNode>;
  const tableNode = createMjmlNodeBranch(MjmlNodeType.Table, tablePropsSchema, {}) satisfies z.ZodType<MjmlTableNode>;
  // A column and a hero take the flow nodes and a raw beside their leaf, as their registry lists them
  const flowChildrenSchema = createMjmlSlotSchema([
    accordionNode,
    buttonNode,
    carouselNode,
    dividerNode,
    imageNode,
    rawNode,
    socialNode,
    spacerNode,
    tableNode,
    textNode,
    navbarNode,
    leafNodeSchema,
  ]);
  const columnNode = createMjmlNodeBranch(MjmlNodeType.Column, columnPropsSchema, {
    children: z.array(flowChildrenSchema),
  }) satisfies z.ZodType<MjmlColumnNode>;
  const groupNode = createMjmlNodeBranch(MjmlNodeType.Group, groupPropsSchema, {
    children: z.array(createMjmlSlotSchema([columnNode, rawNode])),
  }) satisfies z.ZodType<MjmlGroupNode>;
  const heroNode = createMjmlNodeBranch(MjmlNodeType.Hero, heroPropsSchema, {
    children: z.array(flowChildrenSchema),
  }) satisfies z.ZodType<MjmlHeroNode>;
  const sectionNode = createMjmlNodeBranch(MjmlNodeType.Section, sectionPropsSchema, {
    children: z.array(createMjmlSlotSchema([columnNode, groupNode, rawNode])),
  }) satisfies z.ZodType<MjmlSectionNode>;
  const wrapperNode = createMjmlNodeBranch(MjmlNodeType.Wrapper, wrapperPropsSchema, {
    children: z.array(createMjmlSlotSchema([heroNode, rawNode, sectionNode])),
  }) satisfies z.ZodType<MjmlWrapperNode>;

  return z.discriminatedUnion("type", [
    accordionElementNode,
    accordionNode,
    accordionTextNode,
    accordionTitleNode,
    buttonNode,
    carouselImageNode,
    carouselNode,
    columnNode,
    dividerNode,
    groupNode,
    heroNode,
    imageNode,
    navbarLinkNode,
    navbarNode,
    rawNode,
    sectionNode,
    socialElementNode,
    socialNode,
    spacerNode,
    tableNode,
    textNode,
    wrapperNode,
    leafNodeSchema,
  ]) satisfies z.ZodType<MjmlNode>;
};
