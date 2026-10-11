// A transaction that aborts with no error of its own, such as an `abort()` call, reports the AbortError the spec
// Names. Its own error comes first, so the failure that caused the abort is what the caller sees
export const getTransactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => {
      resolve();
    });
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new DOMException("The transaction was aborted", "AbortError"));
    });
  });
