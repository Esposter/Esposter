const WORD = 4;
// A MonoBehaviour's raw export leads with its game object and script as pointers and its enabled flag, then its name, a
// Length and that many characters aligned to four
const NAME_LENGTH_OFFSET = 28;
// Where a MonoBehaviour's raw export holds its own fields, past its header and its name
export const getMonoBehaviourFieldsOffset = (bytes: Buffer): number =>
  NAME_LENGTH_OFFSET + WORD + Math.ceil(bytes.readUInt32LE(NAME_LENGTH_OFFSET) / WORD) * WORD;
