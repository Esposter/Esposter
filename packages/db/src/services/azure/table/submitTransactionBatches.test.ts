import type { TableClient, TableTransactionResponse, TransactionAction } from "@azure/data-tables";

import { submitTransactionBatches } from "@/services/azure/table/submitTransactionBatches";
import { AZURE_MAX_BATCH_SIZE } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const getAction = (entity: { partitionKey: string; rowKey: string }): TransactionAction => ["delete", entity];
const getSubmittedBatchSizes = (submitTransaction: ReturnType<typeof vi.fn<TableClient["submitTransaction"]>>) =>
  submitTransaction.mock.calls.map(([actions]) => actions.length);

describe(submitTransactionBatches, () => {
  const partitionKey = "";
  const transactionResponse: TableTransactionResponse = {
    getResponseForEntity: () => undefined,
    status: 202,
    subResponses: [],
  };
  const entities = Array.from({ length: AZURE_MAX_BATCH_SIZE * 2 + 1 }, (_value, index) => ({
    partitionKey,
    rowKey: String(index),
  }));

  test("splits entities into batches of at most AZURE_MAX_BATCH_SIZE actions", async () => {
    expect.hasAssertions();

    const submitTransaction = vi.fn<TableClient["submitTransaction"]>(() => Promise.resolve(transactionResponse));
    await submitTransactionBatches({ submitTransaction }, entities, getAction);

    expect(getSubmittedBatchSizes(submitTransaction)).toStrictEqual([
      AZURE_MAX_BATCH_SIZE,
      AZURE_MAX_BATCH_SIZE,
      entities.length - AZURE_MAX_BATCH_SIZE * 2,
    ]);
  });

  test("submits batches sequentially", async () => {
    expect.hasAssertions();

    const events: string[] = [];
    const submitTransaction = vi.fn<TableClient["submitTransaction"]>(async () => {
      events.push("start");
      await Promise.resolve();
      events.push("end");
      return transactionResponse;
    });
    await submitTransactionBatches({ submitTransaction }, entities, getAction);

    expect(events).toStrictEqual(["start", "end", "start", "end", "start", "end"]);
  });

  test("calls onSubmit per batch after that batch commits", async () => {
    expect.hasAssertions();

    const events: string[] = [];
    const submitTransaction = vi.fn<TableClient["submitTransaction"]>(async () => {
      await Promise.resolve();
      events.push("submit");
      return transactionResponse;
    });
    await submitTransactionBatches({ submitTransaction }, entities, getAction, () => {
      events.push("onSubmit");
    });

    expect(events).toStrictEqual(["submit", "onSubmit", "submit", "onSubmit", "submit", "onSubmit"]);
  });

  test("fails submit with a rejected batch, leaving later batches unsubmitted", async () => {
    expect.hasAssertions();

    const error = new InvalidOperationError(Operation.Update, submitTransactionBatches.name, partitionKey);
    const submittedBatches: number[] = [];
    const submitTransaction = vi
      .fn<TableClient["submitTransaction"]>()
      .mockResolvedValueOnce(transactionResponse)
      .mockRejectedValueOnce(error);

    await expect(
      submitTransactionBatches({ submitTransaction }, entities, getAction, (batch) => {
        submittedBatches.push(batch.length);
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: ${error.message}]`);

    expect(getSubmittedBatchSizes(submitTransaction)).toStrictEqual([AZURE_MAX_BATCH_SIZE, AZURE_MAX_BATCH_SIZE]);
    expect(submittedBatches).toStrictEqual([AZURE_MAX_BATCH_SIZE]);
  });
});
