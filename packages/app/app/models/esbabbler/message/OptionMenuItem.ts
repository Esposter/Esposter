export interface OptionMenuItem<T = undefined> {
  color?: string;
  icon: string;
  onClick: (event: T extends undefined ? KeyboardEvent | MouseEvent : T) => void;
  shortTitle?: string;
  title: string;
}
