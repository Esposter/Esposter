import type { TRPCRouter } from "@@/server/trpc/routers";

export type TRPCPath = TRPCRouter["_def"]["procedures"];
