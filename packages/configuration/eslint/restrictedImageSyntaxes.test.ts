import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedImageSyntaxes from "@esposter/configuration/eslint/restrictedImageSyntaxes.js";
import { describe } from "vitest";

describe("restrictedImageSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedImageSyntaxes,
    fixtures: [
      {
        filePath: "imagePart.vue",
        name: "imagePart",
        source: '<template>\n  <Avatar.Image src="/" />\n</template>',
        violations: 1,
      },
      {
        filePath: "imagePartAs.vue",
        name: "imagePartAs",
        source: '<template>\n  <Image.Img :as="NuxtImg" src="/" />\n</template>',
        violations: 0,
      },
      { filePath: "asImg.vue", name: "asImg", source: '<template>\n  <Atom as="img" />\n</template>', violations: 1 },
      {
        filePath: "boundAsImg.vue",
        name: "boundAsImg",
        source: '<template>\n  <Avatar.Image :as="\'img\'" src="/" />\n</template>',
        violations: 1,
      },
    ],
  });
});
