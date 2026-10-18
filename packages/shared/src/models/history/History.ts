// The entries an undo can reverse, newest last, and the entries an undo has reversed, newest first, within a bound
export interface History<T> {
  future: T[];
  limit: number;
  past: T[];
}
