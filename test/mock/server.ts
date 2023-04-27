import { clickerHandlers } from "@/test/mock/trpc/clicker";
import { postHandlers } from "@/test/mock/trpc/post";
import { setupServer } from "msw/node";

// @NOTE: This doesn't actually work and isn't intercepting trpc requests
// when running vitest for whatever reason
export const server = setupServer(...clickerHandlers, ...postHandlers);
