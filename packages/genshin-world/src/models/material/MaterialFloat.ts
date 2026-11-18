import { z } from "zod";

// A float a material holds, which may be unbounded or undefined, as the game saves it. JSON has no number for those, so
// They are written as their tokens (`encodeNonFiniteFloat`) and read back here as the number each token stands for
export const materialFloatSchema = z.union([z.number(), z.enum(["-Infinity", "Infinity", "NaN"]).transform(Number)]);
