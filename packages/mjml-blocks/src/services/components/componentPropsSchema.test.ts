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

describe("componentPropsSchema", () => {
  // Each component lists the non-attribute keys its own props schema holds: its content or its decorative flag, its slots being the branch's
  test.each([
    ["mj-accordion", accordionPropsSchema, accordionAttributes, []],
    ["mj-accordion-element", accordionElementPropsSchema, accordionElementAttributes, []],
    ["mj-accordion-text", createMjmlAccordionTextPropsSchema(TEST_RICH_TEXT), accordionTextAttributes, ["content"]],
    ["mj-accordion-title", accordionTitlePropsSchema, accordionTitleAttributes, ["content"]],
    ["mj-button", buttonPropsSchema, buttonAttributes, ["content"]],
    ["mj-carousel", carouselPropsSchema, carouselAttributes, []],
    ["mj-carousel-image", carouselImagePropsSchema, carouselImageAttributes, ["decorative"]],
    ["mj-column", columnPropsSchema, columnAttributes, []],
    ["mj-divider", dividerPropsSchema, dividerAttributes, []],
    ["mj-group", groupPropsSchema, groupAttributes, []],
    ["mj-hero", heroPropsSchema, heroAttributes, []],
    ["mj-image", imagePropsSchema, imageAttributes, ["decorative"]],
    ["mj-navbar", navbarPropsSchema, navbarAttributes, []],
    ["mj-navbar-link", navbarLinkPropsSchema, navbarLinkAttributes, ["content"]],
    ["mj-raw", rawPropsSchema, rawAttributes, ["content"]],
    ["mj-section", sectionPropsSchema, sectionAttributes.allowedAttributes, []],
    ["mj-social", socialPropsSchema, socialAttributes, []],
    ["mj-social-element", socialElementPropsSchema, socialElementAttributes, ["content"]],
    ["mj-spacer", spacerPropsSchema, spacerAttributes, []],
    ["mj-table", tablePropsSchema, tableAttributes, ["content"]],
    ["mj-text", createMjmlTextPropsSchema(TEST_RICH_TEXT), textAttributes, ["content"]],
    ["mj-wrapper", wrapperPropsSchema, wrapperAttributes, []],
  ])(
    "%s's props schema keys are its allowed attributes and its own non-attribute keys",
    (_type, propsSchema, allowedAttributes, nonAttributeKeys) => {
      expect.hasAssertions();

      expect(Object.keys(propsSchema.shape).toSorted()).toStrictEqual(
        [...Object.keys(allowedAttributes), ...nonAttributeKeys].toSorted(),
      );
    },
  );
});
