// A ticked task opens on its number
const TICKED_TASK_REGEX = /^- \[[xX]\] (?<number>\d+(?:\.\d+)+)/u;
// A task's lines stop at a blank line, a heading or the next bullet
const TASK_END_REGEX = /^(?:\s*$|#|\s*- )/u;
const VERIFY_MARKER = "Verify:";

// The Verify clause of each ticked task of a `tasks.md`: its text from the marker to the end of the task's lines, with the
// Task's number. A ticked task with no Verify clause has nothing to check and is left out.
export const readTickedVerifyClauses = (tasksText: string): { number: string; verify: string }[] => {
  const lines = tasksText.split(/\r?\n/u);
  return lines.flatMap((line, index) => {
    const number = TICKED_TASK_REGEX.exec(line)?.groups?.number;
    if (number === undefined) return [];

    const followingLines = lines.slice(index + 1);
    const endIndex = followingLines.findIndex((followingLine) => TASK_END_REGEX.test(followingLine));
    const task = [line, ...(endIndex === -1 ? followingLines : followingLines.slice(0, endIndex))].join("\n");
    const verifyIndex = task.indexOf(VERIFY_MARKER);
    return verifyIndex === -1 ? [] : [{ number, verify: task.slice(verifyIndex) }];
  });
};
