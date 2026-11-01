# Writing an upstream report

Read when a gap only upstream can close is written up for the owner to file by hand ("Unfiled upstream issues" in `SKILL.md`).

A report is a small, checked experiment that someone else can run in a minute. It does not describe this repository. It is written after the experiment is proven, never before.

## Where a draft lives

- **A draft is a paste-ready markdown file** in a `reports` folder of the OpenSpec change that found the gap. The first line is the title and the rest is the body. One report per file. The owner files it by hand. Once it is filed, the file goes and the change links the issue.
- **The target's own form decides the headings.** Read it first: `gh api repos/<owner>/<repo>/contents/.github/ISSUE_TEMPLATE` lists the forms. Keep its field names as headings, and add the sections below that the form lacks.
- **Match the earlier reports we opened in the same repository** (`gh search issues --repo <owner>/<repo> --author <login>`): their title shape, their section order and how they quote an error.

## Section order

1. **Summary.** One or two sentences: what fails, and which tool accepts the same input.
2. **Context.** How the gap was found, in two or three sentences, with no name from this repository.
3. **Environment.** Exact versions, the operating system, and the oracle (the tool that accepts the input today).
4. **Reproduction.** The manifest, the configuration and each file in full, then the command.
5. **Actual.** The error lines, verbatim. A position in generated code is said to be in generated code.
6. **Expected.** What the oracle does, and the proof that the oracle reads the file.
7. **Isolation.** A table: one change at a time from the reproduction, and the result of each. Add the versions tested.
8. **Not known.** What does not match the claim, and what was not checked.
9. **Not a duplicate of.** The nearest issues and pull requests, and why each differs.

## Prove the report before writing it

A report that names the wrong trigger costs the maintainer a day. These steps keep the trigger honest.

1. **Build the reproduction as a standalone project** outside the repository: its own manifest with exact versions, no workspace and no name from this repository.
2. **Run the target and the oracle.** The report is the difference between them.
3. **Prove the oracle reads the file.** Add one deliberate real error and check that both tools report it.
4. **Reduce** until removing any line makes the difference vanish.
5. **Change one thing at a time and record each result.** The first guess about the trigger is often wrong, and only the table shows which condition counts.
6. **Run the oldest version the project still installs, and some between.** Write "regression" only when an older version passes. Run the newest release last: a fix may already be out, and releases can come within hours of each other.
7. **Check the claim against the real code.** Count the real files that match the stated trigger and the ones that report it. List the ones that do not agree in "Not known".
8. **Search the tracker** (open and closed, issues and pull requests) by the symptom words, the diagnostic code and the generated names, and read each near match through to its fix and the release that holds it. A search that returns nothing is not proof. Name the nearest results and say why each differs.
9. **Understand every gap found in the same pass before filing any.** A report filed early names a trigger the next gap may overturn.
10. **State what was not checked.**

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

## Keep out

- **A name, a path or a count from this repository.** Say "many components", never a number the next commit changes.
- **A cause stated as fact when only the symptom is proven.** Quote the generated lines and write "the cause is not known" or "likely".
- **A date, a session or a link to a chat.**
- **A request for more than the oracle already does.** The ask is "no diagnostic, as with the oracle".
