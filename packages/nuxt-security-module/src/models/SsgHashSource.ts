import type { SecurityState } from "#src/runtime/services/getSecurityState";

export type SsgHashSource = [kind: keyof SecurityState["hashes"], source: string];
