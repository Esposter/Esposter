import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe } from "vitest";

// Registers the hooks that give each test a fresh directory and remove it afterwards, and returns the getter for the
// directory the current test owns
export const setupTemporaryDirectory = (): (() => string) => {
  let directory = "";

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "nuxt-security-module-"));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  return () => directory;
};

describe.todo("setupTemporaryDirectory");
