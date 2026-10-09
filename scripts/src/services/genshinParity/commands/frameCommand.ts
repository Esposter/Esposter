import type { SubCommandsDef } from "citty";

import { writeReferenceFrame } from "#src/services/genshinParity/shared/writeReferenceFrame";
import { defineCommand } from "citty";
import { basename, extname } from "node:path";

export const frameCommand: SubCommandsDef[string] = defineCommand({
  args: {
    at: { description: "The second of the capture the frame is taken at", required: true, type: "string" },
    capture: { description: "A file in captures, as clip names it", required: true, type: "positional" },
    name: {
      default: "",
      description: "The reference's folder name, the capture's own name when not given",
      required: false,
      type: "string",
    },
  },
  meta: {
    description: "One frame of a capture into references/<name>/, beside a SOURCE.txt naming its video and second",
    name: "frame",
  },
  run: async ({ args }) => {
    const name = args.name || basename(args.capture, extname(args.capture));
    console.log(await writeReferenceFrame(args.capture, Number(args.at), name));
  },
});
