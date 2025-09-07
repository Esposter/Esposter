import { z } from "zod";

export enum GeneralNodeType {
  Rectangle = "Rectangle",
}

export const generalNodeTypeSchema = z.enum(GeneralNodeType);
