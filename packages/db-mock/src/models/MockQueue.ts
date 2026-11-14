import type { Miniflare } from "miniflare";

export type MockQueue = Awaited<ReturnType<Miniflare["getQueueProducer"]>>;
