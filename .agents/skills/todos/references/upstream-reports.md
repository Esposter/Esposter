# Writing an upstream report

Read when a gap only upstream can close is written up for the owner to file by hand ("Unfiled upstream issues" in `SKILL.md`).

A report is a small, checked experiment that someone else can run in a minute. It does not describe this repository. It is written after the experiment is proven, never before.

**The maintainer's time is the cost being minimised.** A report that makes them reproduce, reduce, search or guess the cause spends the time this page exists to save. So the report hands over the reproduction, the generated output, the line of the maintainer's own source that causes it, and the one-sentence change that would fix it, and nothing else.

## Where a draft lives

- **A draft is a paste-ready markdown file** in a `reports` folder of the OpenSpec change that found the gap. The first line is the title and the rest is the body. One report per file. The owner files it by hand. Once it is filed, the file goes and the change links the issue.
- **The target's own form decides the headings.** Read it first: `gh api repos/<owner>/<repo>/contents/.github/ISSUE_TEMPLATE` lists the forms. Keep its field names as headings, and add the sections below that the form lacks.
- **Match the earlier reports I opened in the same repository** (`gh search issues --repo <owner>/<repo> --author <login>`): their title shape, their section order and how they quote an error.

## Section order

1. **Summary.** One or two sentences: what fails, and which tool accepts the same input.
2. **Context.** The opening sentence, and for a set the Related line ("A set found in one pass"). Nothing about this repository except the link in "Real occurrence".
3. **Environment.** Exact versions, the operating system, and the oracle (the tool that accepts the input today).
4. **Reproduction.** The manifest, the configuration and each file in full, then the command.
5. **Actual.** The error lines, verbatim. A position in generated code is said to be in generated code.
6. **Expected.** What the oracle does, and the proof that the oracle reads the file.
7. **Cause.** The function and line in the target's source that produce the wrong output, quoted, at the tag of the version tested, and the one-sentence change that would fix it. Written as "the cause is" only when a run confirmed it, as "likely" when the source was only read, and as "not known" when the source was searched and nothing was found.
8. **Real occurrence.** A permalink to one line of the real code that has the bug, from a public repository, pinned to a pushed commit (`https://github.com/<owner>/<repo>/blob/<sha>/<path>#L<line>`), so the line stays where it was read. The reproduction shows the bug is minimal and the occurrence shows it is real. One link, no description of the repository.
9. **Isolation.** Only when it shows which condition triggers the bug. A table: one change at a time from the reproduction, and the result of each. Leave it out when the reproduction is already the one condition.
10. **Not known.** Only when something is. What does not match the claim, what was not checked, and any fix that was read and not applied. Leave it out when there is nothing to say.
11. **Not a duplicate of.** The nearest issues and pull requests, and why each differs.

## Prove the report before writing it

A report that names the wrong trigger costs the maintainer a day. These steps keep the trigger honest.

1. **Build the reproduction as a standalone project** outside the repository: its own manifest with exact versions, no workspace and no name from this repository.
2. **Run the target and the oracle.** The report is the difference between them.
3. **Prove the oracle reads the file.** Add one deliberate real error and check that both tools report it.
4. **Reduce** until removing any line makes the difference vanish, then rename to `Foo`, `Bar` and `Baz` and run it again. The rename is part of the reduction: a name that carried meaning, a literal type or a one-line shape that carried the trigger shows up as a reproduction that now passes. Keep every line that the passing run proves necessary, even when it looks like style (a block body in place of an expression body, a multi-line attribute).
5. **Change one thing at a time and record each result.** The first guess about the trigger is often wrong, and only the table shows which condition counts.
6. **Run the oldest version the project still installs, and some between.** Write "regression" only when an older version passes. Run the newest release last: a fix may already be out, and releases can come within hours of each other.
7. **Find the cause in the source.** The source is public, so clone it at the tag of the version tested into a scratch directory and read it before writing. Follow the generated output back to the code that wrote it, and quote that line. A reduction is the cheaper half of the maintainer's work; the line is the other half. Change the code mentally or in the scratch clone to confirm the cause: a fix that does not remove the symptom names the wrong line. Do not open a pull request unless the owner asks.
8. **Check the claim against the real code.** Count the real files that match the stated trigger and the ones that report it. List the ones that do not agree in "Not known".
9. **Search the tracker** (open and closed, issues and pull requests) by the symptom words, the diagnostic code and the generated names, and read each near match through to its fix and the release that holds it. A search that returns nothing is not proof. Name the nearest results and say why each differs.
10. **Understand every gap found in the same pass before filing any.** A report filed early names a trigger the next gap may overturn.
11. **State what was not checked.**

## A set found in one pass

Several gaps found by one migration are filed as one issue per bug, in one sitting, and nothing else. A maintainer fixes and closes one bug per issue, and a tracking or umbrella issue is one more item for them to triage, so there is none.

- **Each issue is complete alone**: the reproduction, the output, the cause and the nearest issues are in the issue itself.
- **The Context opens with one shared sentence**: what is being adopted and for what, and that this issue is one of a batch found doing so, in the first person singular ("I was trying to adopt `<tool>` for `<framework>` type checking and ran into this, among a few others."). The versions and the oracle's result stay in Environment, and the rest of the Context is only what is specific to this bug. The sentence is the same in each issue and carries no number from this repository.
- **A "Related" line closes the Context** and names the earlier issues of the set by number, one clause each. File in this order, so each issue links the ones before it and GitHub back-links the earlier ones with no edit.
- **Every issue is actionable**: it has a reproduction that fails, an oracle that passes, a cause or the statement that it is not known, and a nearest-issues check. An issue missing any of these is not filed until it has them, or is not filed.
- **Order by value to the maintainer**: a bug that hides other diagnostics, then one that reports false errors, then one that misses real errors, then the rest.

## Writing it (ASD-STE100)

The text follows the writing rules of ASD-STE100 Simplified Technical English, as this page reads them. ASD publishes the standard. This page does not copy its dictionary or its text.

- **One idea per sentence.** An instruction has at most 20 words. A description has at most 25.
- **A paragraph has at most six sentences** and starts with its topic.
- **Use the active voice.** Say who does what: "The mapper writes a read of the key", not "A read of the key is written".
- **Use simple tenses.** Use the present for what a tool does and the past for what was run. Do not write "would", "might" or "seems to". State the fact, or state that it is not known.
- **Give an instruction as a command**: "Run the command." Start a prohibition with "Do not".
- **Keep the articles** (a, an, the).
- **Use at most three nouns in a row.**
- **One word has one meaning in the whole report.** Choose one name for a thing, for example "the mapper", "the generated code" and "the oracle", and keep it.
- **Use no idiom and no humor.** Use one plain verb where a phrasal verb exists: "fail", not "blow up".
- **Quote verbatim** what cannot change: error text, code, versions and tool names. The words around them stay plain.

Before: "It looks like the mapper seems to choke when a model is being used next to props."

After: "The mapper reports TS7053 when a component calls both macros."

## Footer

- **Every draft ends with the footer line** `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, after a blank line. The owner checks each report by hand before filing, and the footer says which reports were generated. A report is not filed without it.

## Keep out

- **A count from this repository, or a path in prose.** Say "many components", never a number the next commit changes. The one allowed link to this repository is the "Real occurrence" permalink.
- **A cause stated as fact when only the symptom is proven.** Quote the generated lines and write "the cause is not known" or "likely".
- **A date, a session or a link to a chat.**
- **A request for more than the oracle already does.** The ask is "no diagnostic, as with the oracle".
