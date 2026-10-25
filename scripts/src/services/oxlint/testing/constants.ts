export const MESSAGE =
  "A suite importing setupMswTrpc names the timers it fakes, and never `setTimeout`: the harness's afterEach waits one timer boundary for msw to answer what is in flight, and under a frozen clock that wait never ends";
export const MSW_TRPC_MODULE_SUFFIX = "/services/trpc/mswTrpc.test";
export const FAKED_TIMER = "setTimeout";
