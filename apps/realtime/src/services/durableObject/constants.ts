// The close codes a peer may report but no endpoint may send (RFC 6455, section 7.4.1): the runtime throws on a close
// That names one
export const RESERVED_CLOSE_CODES: ReadonlySet<number> = new Set([1004, 1005, 1006, 1015]);
