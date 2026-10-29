import { REMOTE_MAIN_REF, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

export const checkIsMainAncestor = (): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", REMOTE_MAIN_REF, REMOTE_QUEUE_REF])).match(
    () => true,
    () => false,
  );
