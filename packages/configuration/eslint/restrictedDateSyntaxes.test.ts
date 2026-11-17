import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import { describe } from "vitest";

describe("restrictedDateSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedDateSyntaxes,
    fixtures: [
      {
        filePath: "useTimeAgoCall.vue",
        name: "useTimeAgoCall",
        source: '<script setup lang="ts">\nconst a = useTimeAgo(b);\n</script>',
        violations: 1,
      },
      {
        filePath: "fromNowCall.vue",
        name: "fromNowCall",
        source: '<script setup lang="ts">\nconst a = b.fromNow();\n</script>',
        violations: 1,
      },
      {
        filePath: "formatDateCall.vue",
        name: "formatDateCall",
        source: '<script setup lang="ts">\nconst a = formatDate(b);\n</script>',
        violations: 1,
      },
      {
        filePath: "intlRelativeTimeFormatNew.vue",
        name: "intlRelativeTimeFormatNew",
        source: '<script setup lang="ts">\nconst a = new Intl.RelativeTimeFormat("en").format(b, "day");\n</script>',
        violations: 1,
      },
      {
        filePath: "intlDateTimeFormatCall.vue",
        name: "intlDateTimeFormatCall",
        source: '<script setup lang="ts">\nconst a = Intl.DateTimeFormat("en").format(b);\n</script>',
        violations: 1,
      },
      {
        filePath: "nuxtTimeTemplate.vue",
        name: "nuxtTimeTemplate",
        source: '<template>\n  <NuxtTime :datetime="a" relative />\n</template>',
        violations: 0,
      },
    ],
  });
});
