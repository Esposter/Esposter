import { z } from "zod";

export const BooleanFormat = { OneZero: "OneZero", TrueFalse: "TrueFalse", YesNo: "YesNo" } as const;
export type BooleanFormat = (typeof BooleanFormat)[keyof typeof BooleanFormat];

export const booleanFormatSchema = z.enum(BooleanFormat) satisfies z.ZodType<BooleanFormat>;

export const BooleanFormats: ReadonlySet<BooleanFormat> = new Set(Object.values(BooleanFormat));
