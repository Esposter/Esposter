import { setupVizeEntrySuite } from "#src/services/vize/setupVizeEntrySuite.test";
import { describe } from "vitest";

// A spelling the app's UnoCSS blocklist refuses generates nothing, so vize reports it where a component writes it: a
// Static class token or an attribute with no value, after any variants
describe("blockedSpellings", () => {
  setupVizeEntrySuite({
    directory: "apps/web/app",
    fixtures: [
      { name: "blockedClassToken", template: `<div class="text-center p4" />`, violations: 1 },
      { name: "blockedClassTokenWithVariant", template: `<div class="hover:pa-2" />`, violations: 1 },
      { name: "blockedAttribute", template: `<div p4 />`, violations: 1 },
      { name: "blockedAttributeWithVariant", template: `<div hover:border-red />`, violations: 1 },
      // A spelling anchored at its end is matched only as a whole token
      { name: "blockedWholeToken", template: `<div class="h-screen" />`, violations: 1 },
      // A spelling that is not anchored is matched anywhere in its token
      { name: "blockedInsideToken", template: `<div class="min-h-[100vh]" />`, violations: 1 },
      { name: "canonicalSpellings", template: `<div class="p-4 b-2 h-dvh" mt-2 />`, violations: 0 },
      { name: "canonicalNearWholeToken", template: `<div class="h-screen-a" />`, violations: 0 },
      // An attribute with a value is a component's prop or an attributify pair, which the blocklist leaves alone
      { name: "componentProp", template: `<UiPopover position-area="top" />`, violations: 0 },
    ],
    messageStart: "Don't write a spelling the UnoCSS blocklist refuses",
  });
});
