export interface OptionMenuItem {
  color?: string;
  icon: string;
  onClick: (event: KeyboardEvent | MouseEvent) => void;
  shortTitle?: string;
  title: string;
}
