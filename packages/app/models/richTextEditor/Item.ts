export type Item = {
  active?: boolean;
  icon: string;
  onClick: () => void;
  title: string;
} & Record<string, unknown>;
