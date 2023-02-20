export interface ListItem {
  title: string;
  href?: string;
  icon: string;
  onClick?: () => Promise<void>;
}
