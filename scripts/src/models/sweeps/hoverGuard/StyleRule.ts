export interface StyleRule {
  // Whether the rule sits inside an `@media (hover: hover)` block, however deep
  isHoverGuarded: boolean;
  // The line the rule's selector starts on, in the file the stylesheet was read from
  line: number;
  // The selector, trimmed, as written (a list keeps its commas and its line breaks)
  selector: string;
}
