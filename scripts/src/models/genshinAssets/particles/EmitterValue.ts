// One emitter field as its bytes read it: its constant, or the reason it is not held, a curve or an unplaced offset
export type EmitterValue<T> = { kind: "notHeld"; reason: string } | { kind: "read"; value: T };
