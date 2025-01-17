import type { TRPCCombinedDataTransformer } from "@trpc/server";

import { SuperJSON } from "#shared/services/superjson";
import { isNonJsonSerializable } from "@trpc/client";

export const transformer: TRPCCombinedDataTransformer = {
  input: {
    deserialize: (obj) => (isNonJsonSerializable(obj) ? obj : SuperJSON.deserialize(obj)),
    serialize: (obj) => (isNonJsonSerializable(obj) ? obj : SuperJSON.serialize(obj)),
  },
  output: SuperJSON,
};
