import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The one push at a time, and the marker a commit leaves while one runs. Both sit beside the last push's record
export const QUEUE_DIRECTORY: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "queue");
export const PUSH_LOCK_PATH: string = join(QUEUE_DIRECTORY, "push.lock");
export const PUSH_PENDING_PATH: string = join(QUEUE_DIRECTORY, "push.pending");
// Set in the environment of the push and so of every git it runs, so the post-commit hook those commits fire stands down.
// The hook is a shell script that names the same variable, so the derived name is the one both read
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const PUSHING_ENVIRONMENT_VARIABLE: string = `${SITE_NAME.toUpperCase()}_QUEUE_PUSHING`;
