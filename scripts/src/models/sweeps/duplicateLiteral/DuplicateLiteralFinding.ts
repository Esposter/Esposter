// A string literal two or more files both hold, with the files that hold it
export interface DuplicateLiteralFinding {
  count: number;
  literal: string;
  paths: string[];
}
