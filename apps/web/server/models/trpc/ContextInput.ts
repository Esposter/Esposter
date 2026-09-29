import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

export type ContextInput = CreateWSSContextFnOptions | H3Event;
