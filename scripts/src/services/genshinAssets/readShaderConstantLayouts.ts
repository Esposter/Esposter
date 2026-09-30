// A shader's constant buffer layouts as its raw export holds them, each a run of parameter records laid end to end: a
// Record is its name's length, its name padded to four bytes, then six fields (an index, its rows, its columns, a
// Flag, its array length and its byte offset in its buffer). Every program variant carries its own, ahead of the
// Compiled programs, listing only the parameters it reads
export interface ShaderConstant {
  arrayLength: number;
  byteOffset: number;
  columns: number;
  name: string;
  rows: number;
}
// A parameter's name: the shader's own start with an underscore, Unity's built-ins (`unity_…`) do not
const NAME_REGEX = /[A-Z_a-z]\w{2,}/gu;
// A constant buffer holds at most 64 kilobytes, so no parameter's offset or array reaches past it
const LARGEST_BUFFER_BYTES = 65_536;
const LARGEST_ARRAY_LENGTH = 4096;
const FIELD_BYTES = 4;
const RECORD_FIELDS = 6;
// A layout's lists of vectors, matrices and textures are each led by their count, so a record starting more than a
// Count or two past the last one's end starts another layout
const LAYOUT_GAP_BYTES = 16;
// Every constant buffer layout in a shader's raw export, in the order it holds them
export const readShaderConstantLayouts = (data: Buffer): ShaderConstant[][] => {
  const text = data.toString("latin1");
  const layouts: ShaderConstant[][] = [];
  let layout: ShaderConstant[] = [];
  let lastEnd = Number.NEGATIVE_INFINITY;
  for (const match of text.matchAll(NAME_REGEX)) {
    const start = match.index;
    if (start < FIELD_BYTES) continue;
    // A name's length is its record's own field: the run of word characters can go on into the next field's bytes
    const nameLength = data.readInt32LE(start - FIELD_BYTES);
    if (nameLength < 3 || nameLength > match[0].length) continue;
    const nameEnd = start + nameLength;
    const fieldsStart = nameEnd + ((FIELD_BYTES - (nameEnd % FIELD_BYTES)) % FIELD_BYTES);
    const recordEnd = fieldsStart + FIELD_BYTES * RECORD_FIELDS;
    if (recordEnd > data.length) continue;
    const [, rows = 0, columns = 0, , arrayLength = 0, byteOffset = 0] = Array.from(
      { length: RECORD_FIELDS },
      (_, index) => data.readInt32LE(fieldsStart + FIELD_BYTES * index),
    );
    const isRecord =
      byteOffset >= 0 &&
      byteOffset < LARGEST_BUFFER_BYTES &&
      byteOffset % FIELD_BYTES === 0 &&
      rows >= 1 &&
      rows <= 4 &&
      columns >= 1 &&
      columns <= 4 &&
      arrayLength >= 0 &&
      arrayLength <= LARGEST_ARRAY_LENGTH;
    if (!isRecord) continue;
    const recordStart = start - FIELD_BYTES;
    if (recordStart - lastEnd > LAYOUT_GAP_BYTES && layout.length > 0) {
      layouts.push(layout);
      layout = [];
    }
    layout.push({ arrayLength, byteOffset, columns, name: match[0].slice(0, nameLength), rows });
    lastEnd = recordEnd;
  }
  if (layout.length > 0) layouts.push(layout);
  return layouts;
};
