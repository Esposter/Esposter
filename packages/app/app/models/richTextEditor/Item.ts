export type Item = Record<string, unknown> & {
  active?: boolean;
  icon: string;
  onClick: () => void;
  title: string;
};
