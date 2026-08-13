import type { ContentNavigationItem } from "@nuxt/content";

import { describe } from "vitest";

export const createNavigationItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: path.split("/").at(-1) ?? "",
});

describe.todo("createNavigationItem");
