import type { SubCommandsDef } from "citty";

import { computeUnderBlackShare } from "#src/services/genshinParity/display/computeUnderBlackShare";
import { formatUnderBlackShare } from "#src/services/genshinParity/display/formatUnderBlackShare";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { parseNames } from "#src/services/shared/parseNames";
import { defineCommand } from "citty";
import { join } from "node:path";
import sharp from "sharp";

export const blackCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "References' ids in ParityReferenceMap, separated by commas",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "The share of each reference's pixels holding a channel darker than the tone curve's black at none, encoded for the screen, and each channel's own",
    name: "black",
  },
  run: async ({ args }) => {
    await fetchReferences();
    for (const referenceId of parseNames(args.reference, "reference")) {
      // oxlint-disable-next-line no-await-in-loop -- one frame read at a time, each printed as it is read
      const data = await sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`))
        .removeAlpha()
        .raw()
        .toBuffer();
      const underBlackShare = computeUnderBlackShare(data);
      console.log(
        `${referenceId}: ${formatUnderBlackShare(underBlackShare)} of its pixels hold a channel under ${underBlackShare.blackByte} of 255`,
      );
    }
  },
});
