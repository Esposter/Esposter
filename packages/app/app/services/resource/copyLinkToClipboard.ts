import { getResultAsync, noop } from "@esposter/shared";

// Best-effort by design — a clipboard permission failure is not actionable for us
export const copyLinkToClipboard = (path: string) =>
  getResultAsync(() => window.navigator.clipboard.writeText(`${window.location.origin}${path}`)).match(noop, noop);
