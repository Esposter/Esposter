export interface Item {
  [key: string]: unknown;
  active?: boolean;
  color?: string;
  icon: string;
  onClick: (event: KeyboardEvent | MouseEvent) => void;
  shortTitle?: string;
  title: string;
}
