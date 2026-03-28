import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

enum BaseStringTransformationType {
  Interpolate = "Interpolate",
}

export const StringTransformationType = mergeObjectsStrict(BaseStringTransformationType, BasicStringTransformationType);

export type StringTransformationType = BaseStringTransformationType | BasicStringTransformationType;

export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
