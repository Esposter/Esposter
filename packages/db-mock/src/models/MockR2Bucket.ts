import type { Miniflare } from "miniflare";

export type MockR2Bucket = Awaited<ReturnType<Miniflare["getR2Bucket"]>>;
