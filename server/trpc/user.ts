import { createRouter } from "@/server/trpc/createRouter";
import { z } from "zod";

const userSchema = z.object({ id: z.string(), avatar: z.string(), username: z.string() });
export type User = z.infer<typeof userSchema>;

export const userRouter = createRouter();
