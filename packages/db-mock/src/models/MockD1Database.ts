import type { Miniflare } from "miniflare";

export type MockD1Database = Awaited<ReturnType<Miniflare["getD1Database"]>>;
