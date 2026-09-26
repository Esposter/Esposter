import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedAccessibilitySyntaxes from "@esposter/configuration/eslint/restrictedAccessibilitySyntaxes.js";
import { describe } from "vitest";

describe("restrictedAccessibilitySyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedAccessibilitySyntaxes,
    fixtures: [
      {
        filePath: "focusableHidden.vue",
        name: "focusableHidden",
        source: '<template>\n  <NuxtLink aria-hidden="true" tabindex="-1" to="/" />\n</template>',
        violations: 1,
      },
      {
        filePath: "hiddenInput.vue",
        name: "hiddenInput",
        source: '<template>\n  <input aria-hidden="true" tabindex="-1" type="file" hidden />\n</template>',
        violations: 0,
      },
    ],
  });
});
