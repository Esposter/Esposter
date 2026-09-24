// One choice in a panel's menu: what it reads as, what choosing it gives, and a line saying more
export interface MenuItem<T extends string> {
  description?: string;
  title: string;
  value: T;
}
