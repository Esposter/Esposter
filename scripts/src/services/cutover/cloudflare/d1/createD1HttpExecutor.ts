import type { CloudflareDatabaseTarget } from "#src/models/cutover/CloudflareDatabaseTarget";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { D1Statement } from "#src/models/cutover/D1Statement";

import { d1ApiResponseSchema } from "#src/models/cutover/D1ApiResponse";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

const CLOUDFLARE_API_ORIGIN = "https://api.cloudflare.com/client/v4";

// Every write and read through the D1 HTTP API. A batch is one request whose statements apply in one transaction, so
// `PRAGMA defer_foreign_keys` in it holds until that transaction commits. Values travel as bound parameters only
export const createD1HttpExecutor = (target: CloudflareDatabaseTarget): D1Executor => {
  const url = `${CLOUDFLARE_API_ORIGIN}/accounts/${target.accountId}/d1/database/${target.databaseId}/query`;

  const send = async (body: object) => {
    const response = await getResultAsync(() =>
      fetch(url, {
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${target.token}`, "Content-Type": "application/json" },
        method: "POST",
      }),
    ).match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
    const parsed = d1ApiResponseSchema.parse(
      await getResultAsync(async () => response.json()).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    );
    if (!parsed.success || parsed.result === null)
      throw new InvalidOperationError(
        Operation.Update,
        target.databaseId,
        `D1 refused the request: ${parsed.errors.map(({ message }) => message).join("; ")}`,
      );
    return parsed.result;
  };

  return {
    batch: async (statements: D1Statement[]) => {
      if (statements.length === 0) return;
      const results = await send({ batch: statements.map(({ params, sql }) => ({ params, sql })) });
      const failed = results.find((result) => !result.success);
      if (failed)
        throw new InvalidOperationError(Operation.Update, target.databaseId, "a statement in the batch failed");
    },
    query: async ({ params, sql }: D1Statement) => {
      const [result] = await send({ params, sql });
      return result?.results ?? [];
    },
  };
};
