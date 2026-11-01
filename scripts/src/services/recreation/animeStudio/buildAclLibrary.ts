import { run } from "#src/services/recreation/animeStudio/run";
import { readdirSync } from "node:fs";

// ACL's Windows projects also build under clang with its own flags; only the MHY library's source compiles unmodified
export const buildAclLibrary = (projectDirectory: string, output: string): string => {
  const sources = readdirSync(projectDirectory).filter((file) => file.endsWith(".cpp"));
  run(
    "clang++",
    [
      "-std=c++14",
      "-fms-extensions",
      "-O2",
      "-fPIC",
      "-shared",
      "-DNDEBUG",
      "-D_AS_DLL",
      "-DACLMHY_EXPORTS",
      "-I.",
      "-I..",
      ...sources,
      "-o",
      output,
    ],
    projectDirectory,
  );
  return output;
};
