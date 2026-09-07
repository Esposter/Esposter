import type { ContentNavigationItem } from "@nuxt/content";

import { getSlug } from "@/services/docs/getSlug";
import { describe } from "vitest";

export const createNavigationItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: getSlug(path),
});

describe.todo("createNavigationItem");
