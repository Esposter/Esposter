import { isProd } from "@/util/constants";
import { PrismaClient } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CompatibilityEvent } from "h3";

export const prisma = new PrismaClient({ log: isProd ? ["error"] : ["query", "warn", "error"] });

export const createContext = async (_: CompatibilityEvent) => ({ prisma });

export type Context = inferAsyncReturnType<typeof createContext>;
