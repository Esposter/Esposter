import { setupVizeEntrySuite } from "#src/services/vize/setupVizeEntrySuite.test";
import { describe } from "vitest";

// A component's tag is PascalCase before its first dot, and an HTML, SVG or Vue built-in tag is no component. The
// Vuetify ban reports a `v-*` tag, so casing leaves it alone rather than reporting it twice
describe("componentCasing", () => {
  setupVizeEntrySuite({
    directory: "apps/web/app",
    fixtures: [
      { name: "kebabCaseComponent", template: `<my-thing />`, violations: 1 },
      { name: "lowercaseComponent", template: `<mything />`, violations: 1 },
      { name: "pascalCaseComponent", template: `<MyThing />`, violations: 0 },
      { name: "compoundComponent", template: `<Select.Root />`, violations: 0 },
      // The rule reads the tag up to its first dot only, so a lowercase part after it is no finding
      { name: "compoundLowercasePart", template: `<Select.root />`, violations: 0 },
      { name: "kebabCaseCompound", template: `<my-thing.Root />`, violations: 1 },
      { name: "primitive", template: `<primitive />`, violations: 0 },
      { name: "htmlElement", template: `<div />`, violations: 0 },
      { name: "vueBuiltIn", template: `<component :is="a" />`, violations: 0 },
      { name: "svgElement", template: `<svg><path /></svg>`, violations: 0 },
      // A child component holds an svg element whose root is in its parent, so the name alone decides
      { name: "svgElementWithoutRoot", template: `<g :transform="a" />`, violations: 0 },
      { name: "mathElement", template: `<mrow />`, violations: 0 },
      { name: "vuetifyComponent", template: `<v-btn />`, violations: 0 },
    ],
    messageStart: "Write a component's tag in PascalCase",
  });
});
