import { setupVizeEntrySuite } from "#src/services/vize/setupVizeEntrySuite.test";
import { describe } from "vitest";

// A package styled by scoped CSS generates no utility from an attribute, so an attribute the HTML standard does not
// Define on a native element styles nothing there
describe("scopedStyles", () => {
  setupVizeEntrySuite({
    directory: "packages/vue-phaserjs",
    fixtures: [
      { name: "utilityAttribute", template: `<div size-full />`, violations: 1 },
      { name: "utilityAttributeWithValue", template: `<div p="2" />`, violations: 1 },
      { name: "boundUtilityAttribute", template: `<div :p="padding" />`, violations: 1 },
      // An attribute of another element is none of this one's
      { name: "otherElementsAttribute", template: `<div href="a" />`, violations: 1 },
      { name: "globalAttribute", template: `<div class="a" hidden />`, violations: 0 },
      // The shadow-part globals are the standard's own, on every element (upstream issue 12)
      { name: "shadowPartGlobalAttributes", template: `<div part="a" exportparts="b" />`, violations: 0 },
      { name: "elementsOwnAttribute", template: `<canvas width="1" />`, violations: 0 },
      { name: "ariaAttribute", template: `<div role="status" aria-live="polite" />`, violations: 0 },
      { name: "dataAttribute", template: `<div data-a="a" />`, violations: 0 },
      { name: "vueReservedAttribute", template: `<div ref="a" :key="a" />`, violations: 0 },
      { name: "directive", template: `<div v-if="a" @click="a()" :="a" />`, violations: 0 },
      // A component's props are its own, whatever they are named
      { name: "component", template: `<GameScreen size-full />`, violations: 0 },
      // SVG's own elements share some of HTML's names, and their attributes are SVG's
      { name: "svgAttribute", template: `<svg viewBox="0 0 1 1"><a href="a" /><path d="M0 0" /></svg>`, violations: 0 },
      { name: "svgChildAttribute", template: `<svg><g><span size-full /></g></svg>`, violations: 0 },
      // A foreignObject holds HTML again, so its elements are checked, and an svg nested in it is SVG's once more
      {
        name: "foreignObjectElementAttribute",
        template: `<svg><foreignObject><div size-full /></foreignObject></svg>`,
        violations: 1,
      },
      {
        name: "nestedSvgInForeignObjectAttribute",
        template: `<svg><foreignObject><svg><g><span size-full /></g></svg></foreignObject></svg>`,
        violations: 0,
      },
      { name: "slotProp", template: `<slot :item="a" />`, violations: 0 },
    ],
    messageStart: "Don't write an attribute the HTML standard does not define",
  });
});
