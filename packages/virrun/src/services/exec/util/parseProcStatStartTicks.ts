// `/proc/<pid>/stat` is `<pid> (<comm>) <state> <ppid> …`, and comm is the executable's name written unescaped — it may
// Hold spaces and parentheses — so the fields are counted from the LAST `)`, never from a split of the whole line.
// Starttime is the file's 22nd field, which is the 20th after the state that follows the comm.
const START_TIME_FIELD_INDEX = 19;

export const parseProcStatStartTicks = (stat: string): number =>
  Number(
    stat
      .slice(stat.lastIndexOf(")") + 2)
      .split(" ")
      .at(START_TIME_FIELD_INDEX),
  );
