// One choice in a menu, a select or a field's suggestions: what it reads as, what choosing it gives, and a line
// Saying more
export interface UiMenuItem<T extends string> {
  description?: string;
  // An icon class written whole, drawn before the title
  icon?: string;
  // Drawn in the error colour, for an item that destroys what it acts on
  isDanger?: boolean;
  // Opens a group, drawn after a separator
  isGroupStart?: boolean;
  title: string;
  value: T;
}
