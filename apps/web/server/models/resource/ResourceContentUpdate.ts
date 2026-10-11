// What an update makes of the stored content: the content to save, and what the update answers its caller once saved
export interface ResourceContentUpdate<T> {
  content: unknown;
  result: T;
}
