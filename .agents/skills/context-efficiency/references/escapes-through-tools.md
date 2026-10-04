# Escapes Through Tools

Read before writing any file content that holds a backslash — a string escape, a regex, a Windows path — and after a check reports something that makes no sense for the code you meant to write.

A tool parameter is decoded before it reaches the file, and a shell or an interpreter in between decodes it again. Each hop can eat a backslash or turn an escape into the character it names, and the result is silent: a wrong write looks like a right one in an editor, a diff and `grep` output. The session then chases a failure the file never meant to contain, which is the re-do this skill exists to stop.

## The rule

**Write content that holds a backslash with `Write` or `Edit`, whose text lands verbatim — never through a Bash heredoc, `sed`, `perl`, or a Python or Node string literal.** Then confirm the bytes with `cat -A` or `od -c`, never by reading the line back.

## What each route does to it

- **`\uXXXX`** in any tool parameter lands as the raw character. Double the backslash, or build it in-process (Python `chr(92) + "u001E"`). `sed` and `perl` eat the backslash too — `\u` is a perl case modifier. The enforcer `scripts/src/workspace/controlCharacters.test.ts` catches a raw control byte in any tracked file but a vendored skill's, which is its publisher's; run it rather than trusting your eyes.
- **`\n` inside a patch script's string literal** becomes a real newline once the interpreter reads it, so a patched `write("…\n")` is split across two lines — a syntax error in the file.
- **`\\` in a path** is lost on its way through a heredoc, and the one in front of an interpolation escapes the interpolation instead. Never spell a Windows path with backslash literals in source at all — build it with `path.win32.join(...)`, which needs no escape to survive anything.
