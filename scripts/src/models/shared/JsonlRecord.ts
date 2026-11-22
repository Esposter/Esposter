// One parsed line of a JSON Lines file, with where it sits so an error can name it
export interface JsonlRecord<T> {
  location: string;
  record: T;
}
