import { z } from "zod";

export const Environment = { Development: "development", Production: "production", Test: "test" } as const;
export type Environment = (typeof Environment)[keyof typeof Environment];

export const environmentSchema = z.enum(Environment) satisfies z.ZodType<Environment>;
