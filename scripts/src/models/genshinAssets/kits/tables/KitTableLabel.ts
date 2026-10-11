// One label of a talent's table, as the English text names it at the first level, `CD|{param6:F1}s`: its text before
// The bar, read as the PC writes it, and the parameter indexes it reads in order from 0, each as many times as the
// Format repeats it
export interface KitTableLabel {
  indexes: number[];
  label: string;
}
