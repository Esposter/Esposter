import { checkIsRetryablePush } from "#src/services/land/checkIsRetryablePush";
import { describe, expect, test } from "vitest";

describe(checkIsRetryablePush, () => {
  test("retries a push the remote turned down because the queue moved, or a ref it could not lock", () => {
    expect.hasAssertions();

    expect(checkIsRetryablePush(" ! [rejected]        HEAD -> ai/queue (fetch first)")).toBe(true);
    expect(checkIsRetryablePush(" ! [rejected]        HEAD -> ai/queue (non-fast-forward)")).toBe(true);
    expect(checkIsRetryablePush("error: cannot lock ref 'refs/heads/ai/queue'")).toBe(true);
  });

  test("gives up on any other failure at once", () => {
    expect.hasAssertions();

    expect(checkIsRetryablePush("fatal: unable to access 'https://github.com/': Could not resolve host")).toBe(false);
    expect(checkIsRetryablePush(" ! [remote rejected] HEAD -> ai/queue (pre-receive hook declined)")).toBe(false);
  });
});
