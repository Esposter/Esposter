import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedEventSyntaxes from "@esposter/configuration/eslint/restrictedEventSyntaxes.js";
import { describe } from "vitest";

describe("restrictedEventSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedEventSyntaxes,
    fixtures: [
      {
        filePath: "bareClickStop.vue",
        name: "bareClickStop",
        source: "<template>\n  <div @click.stop />\n</template>",
        violations: 1,
      },
      {
        filePath: "handledClickStop.vue",
        name: "handledClickStop",
        source: '<template>\n  <button type="button" @click.stop="open()" />\n</template>',
        violations: 0,
      },
      {
        filePath: "barePointerStop.vue",
        name: "barePointerStop",
        source: "<template>\n  <div @mousedown.stop />\n</template>",
        violations: 0,
      },
    ],
  });
});
