// Where `verify` reads a recording and a reference from, and the folder it cuts each frame into
export interface VerifyPaths {
  capturesDirectory: string;
  cutDirectory: string;
  referencePath: (referenceId: string) => string;
}
