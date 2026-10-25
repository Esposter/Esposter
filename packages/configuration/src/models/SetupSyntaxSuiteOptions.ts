import type { SyntaxFixture } from "#src/models/SyntaxFixture";

export interface SetupSyntaxSuiteOptions {
  // The restricted-syntax entries under test, told apart from every other entry by their message
  entries: { message: string }[];
  fixtures: SyntaxFixture[];
}
