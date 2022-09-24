import * as trpc from "@trpc/server";
import type { Context } from "@/server/trpc/context";

export const createRouter = () => trpc.router<Context>();
