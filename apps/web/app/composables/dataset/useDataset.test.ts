// @vitest-environment nuxt
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { DATASET_SOURCE_NOT_FOUND_MESSAGE } from "@/services/dataset/constants";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(useDataset, () => {
  const { trpcMsw } = setupMswTrpc();
  const reference = { id: crypto.randomUUID(), type: DatasetProviderType.Sheet };

  // A reference outlives its source in the consumer's content, so the read that finds nothing tells the owner how to
  // Fix the binding rather than echoing the id it could not resolve
  test("reads a missing source as one to rebind or restore", async () => {
    expect.hasAssertions();

    trpcMsw.dataset.readDataset.query(() => {
      throw new TRPCError({ code: "NOT_FOUND", message: " " });
    });
    const { error, refresh } = useDataset(reference);
    await refresh();

    expect(error.value).toBe(DATASET_SOURCE_NOT_FOUND_MESSAGE);
  });
});
