import { trpcMsw } from "@/test/mock/trpc";
import type { RequestHandler } from "msw";

export const clickerHandlers: RequestHandler[] = [
  trpcMsw.clicker.readUpgrades.query((_, res, ctx) => res(ctx.status(200), ctx.data([]))),
];
