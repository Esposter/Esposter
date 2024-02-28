export interface Item {
  icon: string;
  title: string;
  onClick: () => void;
  active?: boolean;
}
