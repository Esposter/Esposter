// A failed request always carries its error, so the fallback only types the null the DOM declares
export const getRequestError = (request: IDBRequest): DOMException =>
  request.error ?? new DOMException("The request failed without an error", "UnknownError");
