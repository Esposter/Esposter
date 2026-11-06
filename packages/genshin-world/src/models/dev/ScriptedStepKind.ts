// The four steps a scripted session takes itself, each the `kind` a step is written with. A registry line is a string
// And has no kind
export enum ScriptedStepKind {
  Expect = "expect",
  Load = "load",
  Save = "save",
  Wait = "wait",
}
