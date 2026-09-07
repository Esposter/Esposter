import type { BaseTRPCRouter } from "@@/server/trpc/routers";
import type { inferRouterInputs } from "@trpc/server";

export type TRPCRouterInputs = inferRouterInputs<BaseTRPCRouter>;
