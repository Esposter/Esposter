// A hold of the skill as gcsim gives it: the constant its frames are in, and its hitmarks where gcsim gives them as
// Numbers
export interface GcsimHoldSource {
  framesName?: string;
  hitmarks?: { file: string; line: number; name: string; values?: number[] };
}
