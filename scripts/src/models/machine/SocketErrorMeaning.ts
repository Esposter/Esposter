// What a listen or connect error at a socket path means: another listener holds the path, nothing listens at it,
// Nothing is at it at all, or it is none the lock can judge
export const SocketErrorMeaning = {
  Absent: "Absent",
  Contended: "Contended",
  Refused: "Refused",
  Unknown: "Unknown",
} as const;
export type SocketErrorMeaning = (typeof SocketErrorMeaning)[keyof typeof SocketErrorMeaning];
