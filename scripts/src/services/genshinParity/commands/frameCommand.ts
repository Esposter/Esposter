import type { SubCommandsDef } from "citty";

import { cutRecordingFrame } from "#src/services/genshinParity/reference/cutRecordingFrame";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { defineCommand } from "citty";
import { join, parse } from "node:path";

export const frameCommand: SubCommandsDef[string] = defineCommand({
  args: {
    file: { description: "The recording's path, a local video FFmpeg reads", required: true, type: "positional" },
    output: {
      description: "The PNG to write, named after the recording and second in the references folder when not given",
      type: "string",
    },
    seconds: { description: "The second the frame is cut at, such as 52.5", required: true, type: "positional" },
  },
  meta: {
    description:
      "Cut the frame at a second of a local recording into a PNG, the same cut `verify` checks a reference against; prints its path",
    name: "frame",
  },
  run: async ({ args }) => {
    const output = args.output ?? join(REFERENCE_SCRATCH_DIRECTORY, `${parse(args.file).name}-${args.seconds}s.png`);
    await cutRecordingFrame({ file: args.file, second: Number(args.seconds) }, args.file, output);
    console.log(output);
  },
});
