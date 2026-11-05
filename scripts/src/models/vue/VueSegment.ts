// One run of a `.vue` file: the body of a script block, or the markup between two of them
export interface VueSegment {
  isScript: boolean;
  text: string;
}
