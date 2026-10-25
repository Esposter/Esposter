export interface SyntaxFixture {
  // The fixture's file name under the package, whose extension picks the override that lints it
  filePath: string;
  name: string;
  source: string;
  violations: number;
}
