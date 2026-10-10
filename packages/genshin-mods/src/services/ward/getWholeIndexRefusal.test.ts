import { describe, expect, test } from "vitest";

import { getWholeIndexRefusal } from "./getWholeIndexRefusal";

describe(getWholeIndexRefusal, () => {
  test.each([
    ["add a dot", "git add .", "git add ."],
    ["add a dot after the separator", "git add -- .", "git add ."],
    ["add everything with -A", "git add -A", "git add -A"],
    ["add everything with --all", "git add --all", "git add --all"],
    ["update every tracked file with -u", "git add -u", "git add -u"],
    ["update every tracked file with --update", "git add --update", "git add --update"],
    ["intent-to-add over a dot", "git add -N .", "git add ."],
    ["intent-to-add with no path", "git add -N", "git add -N"],
    ["add everything behind a directory flag", "git -C packages/genshin-mods add .", "git add ."],
    ["add everything behind a config flag", "git -c core.autocrlf=true add -A", "git add -A"],
    ["reset with no path", "git reset", "git reset"],
    ["reset quietly", "git reset -q", "git reset"],
    ["reset to a commit with mixed mode", "git reset HEAD~1", "git reset"],
    ["reset hard", "git reset --hard", "git reset"],
    ["reset with the separator and a dot", "git reset -- .", "git reset -- ."],
    ["reset to a commit with a dot after the separator", "git reset HEAD -- .", "git reset -- ."],
    ["restore the index from a dot", "git restore --staged .", "git restore --staged ."],
    ["restore the working tree from a dot", "git restore .", "git restore ."],
    ["stash", "git stash", "git stash"],
    ["stash with a message", 'git stash push -m "wip"', "git stash"],
    ["stash list, which reads only", "git stash list", "git stash"],
    ["checkout a dot", "git checkout .", "git checkout ."],
    ["checkout a dot after the separator", "git checkout -- .", "git checkout ."],
    ["clean", "git clean -fd", "git clean"],
    ["a whole-index add behind a pipe", "ls packages | xargs git add .", "git add ."],
    ["a whole-index add behind an AND", "cd packages && git add -A", "git add -A"],
    ["a whole-index add inside a shell command", 'bash -c "git add ."', "git add ."],
    ["add the checkout's root", "git add :/", "git add ."],
    ["add a dot with its slash", "git add ./", "git add ."],
    ["restore the checkout's root", "git restore :/", "git restore ."],
    ["checkout the checkout's root", "git checkout -- :/", "git checkout ."],
    ["reset a commit with the checkout's root", "git reset HEAD :/", "git reset -- ."],
    ["reset a lone operand, which may be a commit", "git reset HEAD", "git reset"],
  ])("refuses %s", (_description, command, form) => {
    expect.hasAssertions();

    expect(getWholeIndexRefusal(command)?.form).toBe(form);
  });

  test.each([
    ["the session's own folder", "git clean -fd", ""],
    ["a directory flag's folder", "git -C ../other clean -fd", "../other"],
    ["each directory flag from the one before", "git -C ../other -C packages clean -fd", "../other/packages"],
    ["the folder a cd before it moved to", "cd ../other && git clean -fd", "../other"],
    ["a directory flag from the folder a cd moved to", "cd ../other && git -C packages add .", "../other/packages"],
    ["the session's own folder past a cd home", "cd ~ && git clean -fd", ""],
  ])("reads the folder git runs in from %s", (_description, command, directory) => {
    expect.hasAssertions();

    expect(getWholeIndexRefusal(command)?.directory).toBe(directory);
  });

  test.each([
    ["add a named path", "git add packages/genshin-mods/src/register.ts"],
    ["add a named path with -A", "git add -A packages/genshin-mods"],
    ["add a named path with -N", "git add -N packages/genshin-mods/src/register.ts"],
    ["restore a named path from the index", "git restore --staged packages/genshin-mods/src/register.ts"],
    ["reset a named path after the separator", "git reset -- packages/genshin-mods/src/register.ts"],
    ["reset the index to a commit for a named path", "git reset HEAD -- packages/genshin-mods/src/register.ts"],
    ["reset a commit for a named path with no separator", "git reset HEAD packages/genshin-mods/src/register.ts"],
    ["reset only HEAD with soft", "git reset --soft HEAD~1"],
    ["checkout a named path", "git checkout -- packages/genshin-mods/src/register.ts"],
    ["checkout a branch", "git checkout ai/queue"],
    ["clean as a dry run", "git clean -n"],
    ["commit by pathspec", 'git commit -m "docs: a message" -- packages/genshin-mods'],
    ["read-only status", "git status --short"],
    ["read-only diff", "git diff HEAD -- packages"],
    ["a whole-index word inside a commit message", 'git commit -m "docs: git add . is refused now"'],
    ["a whole-index word in an echo", "echo done"],
  ])("allows %s", (_description, command) => {
    expect.hasAssertions();

    expect(getWholeIndexRefusal(command)).toBeUndefined();
  });
});
