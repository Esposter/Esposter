export const MESSAGE =
  "A suite answering tRPC through setupMswTrpc names the timers it fakes, and never `setTimeout`: the batch link arms its dispatch on one, and armed under a frozen clock it never fires for any call left in the file";
export const MSW_TRPC_MODULE_SUFFIX = "/services/trpc/mswTrpc.test";
export const FAKED_TIMER = "setTimeout";
