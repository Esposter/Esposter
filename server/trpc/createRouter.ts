import type { Context } from "@/server/trpc/context";
import * as trpc from "@trpc/server";

export const createRouter = () => trpc.router<Context>();
