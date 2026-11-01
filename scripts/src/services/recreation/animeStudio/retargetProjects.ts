import { TARGET_FRAMEWORK } from "#src/services/recreation/animeStudio/constants";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The edits the Windows build's projects need to publish on macOS: every target framework moved to the one the
// Build uses, and the Windows runtime identifier dropped so the publish's own runtime decides
export const retargetProjects = (root: string): void => {
  const projectPaths = readdirSync(root, { recursive: true })
    .map(String)
    .filter((path) => path.endsWith(".csproj"));
  for (const projectPath of projectPaths) {
    const absolutePath = join(root, projectPath);
    const retargeted = readFileSync(absolutePath, "utf8")
      .replaceAll(
        /<TargetFrameworks>[^<]*<\/TargetFrameworks>/gu,
        `<TargetFramework>${TARGET_FRAMEWORK}</TargetFramework>`,
      )
      .replaceAll(
        /<TargetFramework>net[^<]*<\/TargetFramework>/gu,
        `<TargetFramework>${TARGET_FRAMEWORK}</TargetFramework>`,
      )
      .replaceAll(/^[ \t]*<RuntimeIdentifier>win-x64<\/RuntimeIdentifier>\r?\n/gmu, "");
    writeFileSync(absolutePath, retargeted);
  }
};
