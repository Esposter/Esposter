import { z } from "zod";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export const environmentSchema = z.enum(Environment) satisfies z.ZodType<Environment>;
