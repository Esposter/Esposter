import type { SubCommandsDef } from "citty";

import { measureGlide } from "#src/services/genshinParity/witness/measureGlide";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const glideCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "The id of a recording's frame in ParityReferenceMap, whose capture is read",
      required: true,
      type: "positional",
    },
    time: { description: "The second of the capture to start at", required: true, type: "positional" },
    seconds: { description: "How long to read for", required: true, type: "positional" },
    columns: {
      description: "The capture's columns the layout's landmarks cross, each in its pixels, comma separated",
      required: true,
      type: "string",
    },
    crossings: {
      description: "How many of a landmark's edges of one kind cross each column in a repeat",
      required: true,
      type: "string",
    },
    repeat: { description: "The metres the layout repeats every along the glide", required: true, type: "string" },
    row: { description: "The capture's row the columns are read on, in its pixels", required: true, type: "string" },
  },
  meta: {
    description:
      "Read the pace of a layout gliding toward a still camera off a recording, whatever the camera's pose: the moments its landmarks' edges cross columns of one row, and the pace over each repeat between a crossing and the same kind's a repeat later, with its uncertainty and the frames the recording holds within it",
    name: "glide",
  },
  run: async ({ args }) => {
    const crossingsPerRepeat = Number(args.crossings);
    if (args.crossings.trim() === "" || !Number.isInteger(crossingsPerRepeat) || crossingsPerRepeat < 1)
      throw new InvalidOperationError(Operation.Read, "crossings", `${args.crossings} is not a positive count`);
    const repeats = await measureGlide(args.reference, {
      columns: parseNumbers(args.columns, "columns"),
      crossingsPerRepeat,
      durationSeconds: Number(args.seconds),
      repeatMetres: Number(args.repeat),
      row: Number(args.row),
      startSeconds: Number(args.time),
    });
    for (const { column, from, heldCount, isFalling, speed, to, uncertainty } of repeats)
      console.log(
        `${from.toFixed(3)} to ${to.toFixed(3)} s: ${speed.toFixed(3)} ± ${uncertainty.toFixed(3)} m/s (column ${column}, ${isFalling ? "darkening" : "brightening"}), ${heldCount} frames held`,
      );
  },
});
