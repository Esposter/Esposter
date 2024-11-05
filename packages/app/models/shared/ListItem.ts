export interface ListItem {
  external?: true;
  href?: string;
  icon: string;
  onClick?: () => Promise<void>;
  title: string;
}
