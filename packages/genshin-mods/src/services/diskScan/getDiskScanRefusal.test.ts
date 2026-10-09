import { describe, expect, test } from "vitest";

import { getDiskScanRefusal } from "./getDiskScanRefusal";

// The allowed cases name the repo's own folders and the game's folder, which the package cannot derive from SITE_NAME
// oxlint-disable naming/no-site-name-literal -- The allowed cases are the repo's and the game's own folders, named as they are on disk

describe(getDiskScanRefusal, () => {
  test.each([
    ["find from /", "find / -maxdepth 6 -name yt-dlp.exe"],
    ["find from /c", "find /c -name model.onnx"],
    ["find from a drive's root with a Windows spelling", String.raw`find 'C:\' -name capture.wav`],
    ["find from the home folder", "find ~ -name yt-dlp"],
    ["find from $HOME", 'find "$HOME" -type f'],
    ["find from /Users/<name>", "find /Users/jimmy -name package.json"],
    ["find from the drive's home folder", "find /c/Users/jimmy -maxdepth 4"],
    ["find from a home folder with a trailing slash", "find ~/ -name x"],
    ["find with the depth flag before its root", "find -maxdepth 6 /"],
    ["du over the root", "du -s /"],
    ["du over a home folder", "du -sh /c/Users/jimmy"],
    ["grep -r from the root", "grep -r needle /"],
    ["grep -R from the home folder", "grep -R needle ~"],
    ["grep -rn with the root after a pattern flag", "grep -rn -e needle /c"],
    ["ls -R from the root", "ls -R /"],
    ["a scan behind a pipe", "ls packages | xargs find /"],
    ["a scan behind an AND", "cd packages && du -s ~"],
    ["a scan inside a shell command", 'bash -c "find / -name yt-dlp"'],
    ["a scan inside a shell command with a separator of its own", 'bash -c "find /; echo done"'],
    ["a scan inside a command substitution in double quotes", 'echo "$(find / -name x)"'],
    ["find from the root's glob", "find /* -name x"],
    ["find from a drive's glob", "find /c/* -name x"],
    ["grep -r from the root after a long pattern flag", "grep -r --regexp=needle /"],
  ])("refuses %s", (_description, command) => {
    expect.hasAssertions();

    expect(getDiskScanRefusal(command)).toBeDefined();
  });

  test.each([
    ["a find inside the repo", "find /c/Users/jimmy/Desktop/Software/Esposter/packages -name x"],
    ["a find inside the game's folder", "find ~/Esposter/genshin-parity -name capture.mp4"],
    ["a find inside the game's folder through the variable", 'find "$HOME/Esposter/genshin-parity" -name x'],
    ["a find from the working directory", "find . -name x -maxdepth 2"],
    ["a du over a package", "du -sh packages/genshin-world"],
    ["a grep -r over the repo", "grep -rn needle packages"],
    ["a grep -r over the game's folder", "grep -r needle ~/Esposter/genshin-parity"],
    ["a grep -r with no path", "grep -r needle"],
    ["a grep with the root but no recursion", "grep needle /"],
    ["a grep -r with the root as its pattern", "grep -r / src"],
    ["a grep -r with the root as its pattern flag's operand", "grep -r -e / packages"],
    ["an ls -R over a package", "ls -R packages"],
    ["an ls -r over the root, which is only a reverse sort", "ls -r /"],
    ["an rg over the repo", "rg needle packages"],
    ["a commit message that names a scan", 'git commit -m "docs: find / is refused now"'],
    ["a commit message that names a scan after a separator", 'git commit -m "docs; find / is refused now"'],
  ])("allows %s", (_description, command) => {
    expect.hasAssertions();

    expect(getDiskScanRefusal(command)).toBeUndefined();
  });
});
