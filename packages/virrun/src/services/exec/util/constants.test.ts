import { describe } from "vitest";

export const TEST_DIR = "/a";
export const TEST_FILENAME = "a";
// The host cache root acceptance corpora/snapshots stage into — under $HOME, never os.tmpdir (see
// CreateWorkspaceCorpus for why).
export const HOME_CACHE_DIRECTORY_NAME = ".cache";

describe.todo("constants");
