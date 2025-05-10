export interface OptionMenuItem<T = never> {
  color?: string;
  icon: string;
  onClick: (event: T extends never ? KeyboardEvent | MouseEvent : T) => void;
  shortTitle?: string;
  title: string;
}
