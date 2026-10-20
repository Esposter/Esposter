import type { CreateMjmlRegistryOptions } from "#src/models/CreateMjmlRegistryOptions";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";

import { mjmlAccordionType } from "#src/services/components/mjAccordion";
import { mjmlAccordionElementType } from "#src/services/components/mjAccordionElement";
import { createMjmlAccordionTextType } from "#src/services/components/mjAccordionText";
import { mjmlAccordionTitleType } from "#src/services/components/mjAccordionTitle";
import { mjmlButtonType } from "#src/services/components/mjButton";
import { mjmlCarouselType } from "#src/services/components/mjCarousel";
import { mjmlCarouselImageType } from "#src/services/components/mjCarouselImage";
import { createMjmlColumnType } from "#src/services/components/mjColumn";
import { mjmlDividerType } from "#src/services/components/mjDivider";
import { mjmlGroupType } from "#src/services/components/mjGroup";
import { createMjmlHeroType } from "#src/services/components/mjHero";
import { mjmlImageType } from "#src/services/components/mjImage";
import { mjmlNavbarType } from "#src/services/components/mjNavbar";
import { mjmlNavbarLinkType } from "#src/services/components/mjNavbarLink";
import { mjmlRawType } from "#src/services/components/mjRaw";
import { mjmlSectionType } from "#src/services/components/mjSection";
import { mjmlSocialType } from "#src/services/components/mjSocial";
import { mjmlSocialElementType } from "#src/services/components/mjSocialElement";
import { mjmlSpacerType } from "#src/services/components/mjSpacer";
import { mjmlTableType } from "#src/services/components/mjTable";
import { createMjmlTextType } from "#src/services/components/mjText";
import { mjmlWrapperType } from "#src/services/components/mjWrapper";
import { MJML_BODY_CHILDREN } from "#src/services/constants";
import { createMjmlRootPropsSchema } from "#src/services/createMjmlRootPropsSchema";

// MJML's component set as block types, with the consumer's leaf types beside them and the body's children as the root's content
// A column and a hero take the leaf types' names as their children beside MJML's own, so the leaves are named where the containers are built
export const createMjmlRegistry = <TContent, TContext = unknown>(
  options: CreateMjmlRegistryOptions<TContent, TContext>,
): MjmlRegistry<TContext> => {
  const leafTypeNames = options.leafTypes.map((leafType) => leafType.type);
  const types = [
    mjmlAccordionType,
    mjmlAccordionElementType,
    createMjmlAccordionTextType(options.richText),
    mjmlAccordionTitleType,
    mjmlButtonType,
    mjmlCarouselType,
    mjmlCarouselImageType,
    createMjmlColumnType(leafTypeNames),
    mjmlDividerType,
    mjmlGroupType,
    createMjmlHeroType(leafTypeNames),
    mjmlImageType,
    mjmlNavbarType,
    mjmlNavbarLinkType,
    mjmlRawType,
    mjmlSectionType,
    mjmlSocialType,
    mjmlSocialElementType,
    mjmlSpacerType,
    mjmlTableType,
    createMjmlTextType(options.richText),
    mjmlWrapperType,
    ...options.leafTypes,
  ];
  return {
    children: options.children,
    root: { content: MJML_BODY_CHILDREN, propsSchema: createMjmlRootPropsSchema(types) },
    types,
  };
};
