import type { TRPCError } from "@trpc/server";

// The two codes a missing row can answer with: the input named something that does not exist, or the thing
// Asked for is genuinely absent
export type RequireMutationCode = Extract<TRPCError["code"], "BAD_REQUEST" | "NOT_FOUND">;
