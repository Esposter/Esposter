import { getResultAsync, noop } from "@esposter/shared";

// Best-effort by design — a clipboard permission failure is nothing the user can act on, so it is not put in
// Front of them. It is still logged: a swallow that reports nowhere is indistinguishable from a copy that worked
export const copyLinkToClipboard = (path: string) =>
  getResultAsync(() => window.navigator.clipboard.writeText(`${window.location.origin}${path}`)).match(
    noop,
    console.error,
  );
