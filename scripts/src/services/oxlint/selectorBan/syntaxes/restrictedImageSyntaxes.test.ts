import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_IMAGE_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedImageSyntaxes";
import { describe } from "vitest";

describe("restrictedImageSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_IMAGE_SYNTAXES.bans,
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
