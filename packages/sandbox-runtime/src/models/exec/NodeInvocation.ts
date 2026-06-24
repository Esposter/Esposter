// The part of a parsed `node` command the in-process runner can execute. Step B1 covers inline code
// (-e/--eval); Step B2 extends this with file + args for `node <file>`.
export interface NodeInvocation {
  code: string;
}
