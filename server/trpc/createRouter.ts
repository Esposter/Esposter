import type { Context } from "@/server/trpc/context";
import trpc from "@trpc/server";

export const createRouter = () => trpc.router<Context>();
