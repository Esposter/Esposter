import type { Context } from "#server/trpc/context";
import type { RawCallerFactory } from "#server/trpc/liveTopicWakeCheck.test";
import type { AnyRouter } from "@trpc/server";

import { createWakeCheckedCaller } from "#server/trpc/liveTopicWakeCheck.test";
import { describe, vi } from "vitest";

// The real tRPC index. The setup file hands this module to every suite in its place
const actual = await vi.importActual<typeof import("#server/trpc/index")>("#server/trpc/index");
const createRawCallerFactory = actual.createCallerFactory as unknown as RawCallerFactory;

export const { middleware, publicProcedure, router } = actual;

// A suite's caller, as tRPC builds it, with every call it makes checked by the wake check. Its type is tRPC's own
export const createCallerFactory = ((routerToCall: AnyRouter) => (context: Context) =>
  createWakeCheckedCaller(
    createRawCallerFactory,
    routerToCall,
    context,
  )) as unknown as typeof actual.createCallerFactory;

describe.todo("indexWithWakeCheck");
