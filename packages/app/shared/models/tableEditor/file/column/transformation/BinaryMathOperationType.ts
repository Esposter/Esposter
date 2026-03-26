import { z } from "zod";

export enum BinaryMathOperationType {
  Add = "Add",
  Divide = "Divide",
  Multiply = "Multiply",
  Subtract = "Subtract",
}

export const binaryMathOperationTypeSchema = z.enum(BinaryMathOperationType).meta({ title: "Operation" });
