import { clickerHandlers } from "@/test/mock/trpc/clicker";
import { postHandlers } from "@/test/mock/trpc/post";
import { setupServer } from "msw/node";

export const server = setupServer(...clickerHandlers, ...postHandlers);
