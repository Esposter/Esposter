import { getRequestError } from "#src/services/indexedDb/getRequestError";

export const requestToPromise = <TResult>(request: IDBRequest): Promise<TResult> =>
  new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(getRequestError(request));
    });
  });
