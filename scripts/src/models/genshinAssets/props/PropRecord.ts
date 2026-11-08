import { PropShape } from "#src/models/genshinAssets/props/PropShape";
import { z } from "zod";

// A prop's published outline: its boxes as a visual hull, or its sections as a lathe, numbers alone
export type PropRecord =
  | {
      axis: [number, number];
      foot: number;
      sections: { bottomRadius: number; height: number; topRadius: number }[];
      shape: PropShape.Lathe;
    }
  | { boxes: [number, number, number, number, number, number][]; shape: PropShape.Hull };

// A strict object refuses any key beyond the outline's, so a record carrying the game's vertices, faces or a mesh's name
// Is refused before it is published
export const propRecordSchema: z.ZodType<PropRecord> = z.discriminatedUnion("shape", [
  z.strictObject({
    boxes: z.array(z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()])),
    shape: z.literal(PropShape.Hull),
  }),
  z.strictObject({
    axis: z.tuple([z.number(), z.number()]),
    foot: z.number(),
    sections: z.array(z.strictObject({ bottomRadius: z.number(), height: z.number(), topRadius: z.number() })),
    shape: z.literal(PropShape.Lathe),
  }),
]) satisfies z.ZodType<PropRecord>;
