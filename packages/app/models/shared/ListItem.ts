export interface ListItem {
  href?: string;
  icon: string;
  onClick?: () => Promise<void>;
  title: string;
}
