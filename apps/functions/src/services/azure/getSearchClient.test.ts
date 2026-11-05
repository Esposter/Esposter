import type { SearchIndex } from "@esposter/db-schema";

import { MockSearchClient } from "azure-mock";
import { describe } from "vitest";

export const getSearchClient = (index: SearchIndex) => new MockSearchClient(index);

describe.todo("getSearchClient");
