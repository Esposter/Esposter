import { run } from "#src/services/recreation/animeStudio/run";
import { fetchOk } from "#src/services/shared/fetchOk";
import { getSystemTarPath } from "#src/services/shared/getSystemTarPath";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// A commit's tree as codeload serves it: fetched by its SHA, so a moved branch changes nothing
export const fetchSource = async (
  repository: string,
  sha: string,
  workDirectory: string,
  name: string,
): Promise<string> => {
  const response = await fetchOk(`https://codeload.github.com/${repository}/tar.gz/${sha}`);
  const archive = join(workDirectory, `${name}.tar.gz`);
  const destination = join(workDirectory, name);
  writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  mkdirSync(destination, { recursive: true });
  run(getSystemTarPath(), ["-xzf", archive, "-C", destination, "--strip-components=1"]);
  return destination;
};
