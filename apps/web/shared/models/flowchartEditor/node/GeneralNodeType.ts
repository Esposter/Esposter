import { z } from "zod";

export enum GeneralNodeType {
  Rectangle = "Rectangle",
}

export const generalNodeTypeSchema = z.enum(GeneralNodeType) satisfies z.ZodType<GeneralNodeType>;

export const GeneralNodeTypes = Object.values(GeneralNodeType);
