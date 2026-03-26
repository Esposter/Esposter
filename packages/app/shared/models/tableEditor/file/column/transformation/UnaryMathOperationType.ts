import { z } from "zod";

export enum UnaryMathOperationType {
  Absolute = "Absolute",
  Ceil = "Ceil",
  Floor = "Floor",
  Round = "Round",
}

export const unaryMathOperationTypeSchema = z.enum(UnaryMathOperationType).meta({ title: "Operation" });
