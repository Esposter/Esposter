import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";

enum BaseStringTransformationType {
  Interpolate = "Interpolate",
}

export const StringTransformationType = mergeObjectsStrict(BasicStringTransformationType, BaseStringTransformationType);

export type StringTransformationType = BasicStringTransformationType | BaseStringTransformationType;

export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
