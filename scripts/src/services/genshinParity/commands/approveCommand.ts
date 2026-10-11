import type { SubCommandsDef } from "citty";

import { approveReference } from "#src/services/genshinParity/reference/approveReference";
import { defineCommand } from "citty";

export const approveCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description:
        "A reference's id in ParityReferenceMap, whose screen's image is approved once its compare clears the bar",
      required: true,
      type: "positional",
    },
    variant: {
      description: "A fixture variant whose image is approved beside the screen's base image, in place of the base",
      type: "string",
    },
  },
  meta: {
    description:
      "Approve a screen's visual image once its compare against the stored reference is under the bar, fetching the reference first when it is missing",
    name: "approve",
  },
  run: ({ args }) => approveReference(args.reference, args.variant),
});
