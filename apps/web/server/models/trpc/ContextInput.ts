import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { RequestEvent } from "nuxt/server";

export type ContextInput = CreateWSSContextFnOptions | RequestEvent;
