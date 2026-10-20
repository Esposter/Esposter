import { accordionAttributes, accordionPropsSchema } from "#src/services/components/mjAccordion";
import { accordionElementAttributes, accordionElementPropsSchema } from "#src/services/components/mjAccordionElement";
import { accordionTextAttributes, createMjmlAccordionTextPropsSchema } from "#src/services/components/mjAccordionText";
import { accordionTitleAttributes, accordionTitlePropsSchema } from "#src/services/components/mjAccordionTitle";
import { buttonAttributes, buttonPropsSchema } from "#src/services/components/mjButton";
import { carouselAttributes, carouselPropsSchema } from "#src/services/components/mjCarousel";
import { carouselImageAttributes, carouselImagePropsSchema } from "#src/services/components/mjCarouselImage";
import { columnAttributes, columnPropsSchema } from "#src/services/components/mjColumn";
import { dividerAttributes, dividerPropsSchema } from "#src/services/components/mjDivider";
import { groupAttributes, groupPropsSchema } from "#src/services/components/mjGroup";
import { heroAttributes, heroPropsSchema } from "#src/services/components/mjHero";
import { imageAttributes, imagePropsSchema } from "#src/services/components/mjImage";
import { navbarAttributes, navbarPropsSchema } from "#src/services/components/mjNavbar";
import { navbarLinkAttributes, navbarLinkPropsSchema } from "#src/services/components/mjNavbarLink";
import { rawAttributes, rawPropsSchema } from "#src/services/components/mjRaw";
import { sectionPropsSchema } from "#src/services/components/mjSection";
import { socialAttributes, socialPropsSchema } from "#src/services/components/mjSocial";
import { socialElementAttributes, socialElementPropsSchema } from "#src/services/components/mjSocialElement";
import { spacerAttributes, spacerPropsSchema } from "#src/services/components/mjSpacer";
import { tableAttributes, tablePropsSchema } from "#src/services/components/mjTable";
import { createMjmlTextPropsSchema, textAttributes } from "#src/services/components/mjText";
import { wrapperAttributes, wrapperPropsSchema } from "#src/services/components/mjWrapper";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { TEST_RICH_TEXT } from "#src/services/constants.test";
import { describe, expect, test } from "vitest";

// The keys a props schema holds beside its attributes: the content, the decorative flag, the children and the id
const NON_ATTRIBUTE_KEYS = new Set(["children", "content", "decorative", "id"]);

describe("componentPropsSchema", () => {
  test.each([
    ["mj-accordion", accordionPropsSchema, accordionAttributes],
    ["mj-accordion-element", accordionElementPropsSchema, accordionElementAttributes],
    ["mj-accordion-text", createMjmlAccordionTextPropsSchema(TEST_RICH_TEXT), accordionTextAttributes],
    ["mj-accordion-title", accordionTitlePropsSchema, accordionTitleAttributes],
    ["mj-button", buttonPropsSchema, buttonAttributes],
    ["mj-carousel", carouselPropsSchema, carouselAttributes],
    ["mj-carousel-image", carouselImagePropsSchema, carouselImageAttributes],
    ["mj-column", columnPropsSchema, columnAttributes],
    ["mj-divider", dividerPropsSchema, dividerAttributes],
    ["mj-group", groupPropsSchema, groupAttributes],
    ["mj-hero", heroPropsSchema, heroAttributes],
    ["mj-image", imagePropsSchema, imageAttributes],
    ["mj-navbar", navbarPropsSchema, navbarAttributes],
    ["mj-navbar-link", navbarLinkPropsSchema, navbarLinkAttributes],
    ["mj-raw", rawPropsSchema, rawAttributes],
    ["mj-section", sectionPropsSchema, sectionAttributes.allowedAttributes],
    ["mj-social", socialPropsSchema, socialAttributes],
    ["mj-social-element", socialElementPropsSchema, socialElementAttributes],
    ["mj-spacer", spacerPropsSchema, spacerAttributes],
    ["mj-table", tablePropsSchema, tableAttributes],
    ["mj-text", createMjmlTextPropsSchema(TEST_RICH_TEXT), textAttributes],
    ["mj-wrapper", wrapperPropsSchema, wrapperAttributes],
  ])("%s's props schema keys are its allowed attributes", (_type, propsSchema, allowedAttributes) => {
    expect.hasAssertions();

    expect(
      Object.keys(propsSchema.shape)
        .filter((key) => !NON_ATTRIBUTE_KEYS.has(key))
        .toSorted(),
    ).toStrictEqual(Object.keys(allowedAttributes).toSorted());
  });
});
