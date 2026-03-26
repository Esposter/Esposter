import { z } from "zod";

export enum BooleanFormat {
  OneZero = "OneZero",
  TrueFalse = "TrueFalse",
  YesNo = "YesNo",
}

export const booleanFormatSchema = z.enum(BooleanFormat);
