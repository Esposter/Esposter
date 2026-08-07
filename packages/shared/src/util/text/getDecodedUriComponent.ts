import { getResult } from "@/services/error/getResult";

// `decodeURIComponent` throws a URIError on a lone `%`, which is legal in a blob name, a filename and any other
// User-chosen text that reaches us through a url. Every caller wants a value back rather than an exception —
// The raw form where that is still meaningful, or a rejected sentinel where it is not — so the fallback is the
// Caller's, and the throw never escapes to fail a whole batch over one name.
export const getDecodedUriComponent = (value: string, fallback: string): string =>
  getResult(() => decodeURIComponent(value)).unwrapOr(fallback);
