import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// `--is-ancestor` answers by exit code alone, and it is reflexive: a ref is its own ancestor, so a target equal
// To the base passes as the no-op it is
export const checkIsAncestor = (ancestor: string, descendant: string, cwd?: string): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", ancestor, descendant], cwd)).match(
    () => true,
    // The exit code is the answer: 1 is not an ancestor, and a ref git cannot read is none either
    () => false,
  );
