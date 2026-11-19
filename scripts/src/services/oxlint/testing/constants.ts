export const MESSAGE =
  "A suite importing setupMswTrpc names the timers it fakes, and never `setTimeout`: the harness's afterEach waits one timer boundary for msw to answer what is in flight, and under a frozen clock that wait never ends";
export const MSW_TRPC_MODULE_SUFFIX = "/services/trpc/mswTrpc.test";
export const FAKED_TIMER = "setTimeout";
export const FAKE_CLOCK_ONLY_MESSAGE =
  'A suite on Miniflare fakes the clock and nothing else — `toFake: ["Date"]`: its bindings reach workerd through Node\'s own timers, and with those faked every D1 call stalls, which cost such a suite seconds a test';
// The clocks a test reads, as against the timers that schedule work
export const FAKEABLE_CLOCKS: string[] = ["Date", "Temporal"];
export const MINIFLARE_MODULE = "@esposter/db-mock";
// The app's mock context, which every server suite on the database takes its Miniflare through
export const MINIFLARE_MODULE_SUFFIX = "/trpc/context.test";
