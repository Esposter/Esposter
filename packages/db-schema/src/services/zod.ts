import { z } from "zod";

export const createNameSchema = (maxLength: number) => z.string().trim().min(1).max(maxLength);
