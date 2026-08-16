// A tween always starts where the property already is, so `from` and `start` are the same value
export const getTweenRange = (from: number, to: number) => ({ from, start: from, to });
