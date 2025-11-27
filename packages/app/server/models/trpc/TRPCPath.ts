import type { TRPCRouter } from "@@/server/trpc/routers";
import type { inferRouterInputs } from "@trpc/server";
import type { Paths } from "type-fest";

export type TRPCPath = Paths<inferRouterInputs<TRPCRouter>>;
