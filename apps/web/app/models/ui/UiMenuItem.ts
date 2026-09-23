// One choice in a menu, a select or a field's suggestions: what it reads as, what choosing it gives, and a line
// Saying more
export interface UiMenuItem<T extends string> {
  description?: string;
  title: string;
  value: T;
}
