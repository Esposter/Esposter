import type { TRPCDefaultErrorShape, TRPCError } from "@trpc/server";

import { transformer } from "#shared/services/trpc/transformer";
import { z } from "zod";

// Everything the router answers with that no context decides, shared with the client tests' mock router so a
// Mocked rejection reaches the client in exactly the shape a real one does
export const rootConfig = {
  errorFormatter: ({ error, shape }: { error: TRPCError; shape: TRPCDefaultErrorShape }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.code === "BAD_REQUEST" && error.cause instanceof z.ZodError ? z.treeifyError(error.cause) : null,
    },
  }),
  transformer,
};
