// Pull copies from the peer to this machine, push copies from this machine to the peer
export const TransferDirection = { Pull: "Pull", Push: "Push" } as const;
export type TransferDirection = (typeof TransferDirection)[keyof typeof TransferDirection];
