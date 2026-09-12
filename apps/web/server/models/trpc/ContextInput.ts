import type { H3EventInput } from "@@/server/models/trpc/H3EventInput";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

export type ContextInput = CreateWSSContextFnOptions | H3EventInput;
