import type { SubCommandsDef } from "citty";

import { approveReference } from "#src/services/genshinParity/reference/approveReference";
import { defineCommand } from "citty";

export const approveCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description:
        "A reference's id in ParityReferenceMap, whose screen's image is written; its compare's status against the bar is printed beside it",
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
      "Write a screen's visual image as a snapshot of its current render, printing its compare against the stored reference and that compare's status against the bar, fetching the reference first when it is missing",
    name: "approve",
  },
  run: ({ args }) => approveReference(args.reference, args.variant),
});
