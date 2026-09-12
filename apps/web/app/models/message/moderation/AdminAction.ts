import type { Promisable } from "type-fest";

export type AdminAction = (roomId: string, durationMs?: number) => Promisable<void>;
