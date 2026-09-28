// A pairing under way: the host's address, the one-time code, and until when it is retried. A code the page opened the
// Host with is refused until the host has it, so it is retried until then; a code a link carried is refused only once
// It is used or expired, and is never retried
export interface Pairing {
  address: string;
  code: string;
  // The connection it pairs: a new one, or the one already at this address, paired again in place
  connectionId: string;
  deadline: number;
  isOpenedByPage: boolean;
}
