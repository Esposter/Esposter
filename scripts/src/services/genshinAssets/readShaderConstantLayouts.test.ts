import { readShaderConstantLayouts } from "#src/services/genshinAssets/readShaderConstantLayouts";
import { describe, expect, test } from "vitest";

const FIELD_BYTES = 4;
// One parameter record as a shader's export holds it: its name's length and padded name, then an index, its rows, its
// Columns, a flag, its array length and its byte offset. The index is the byte `8`, a word character, so a name ending
// On a four-byte boundary runs on into it unless its length is read from its own field
const WORD_CHARACTER_INDEX = 0x38;
const createRecord = (name: string, columns: number, byteOffset: number): Buffer => {
  const nameBytes = Buffer.from(name, "latin1");
  const padding = (FIELD_BYTES - (nameBytes.length % FIELD_BYTES)) % FIELD_BYTES;
  const fields = Buffer.alloc(FIELD_BYTES * 6);
  fields.writeInt32LE(WORD_CHARACTER_INDEX);
  fields.writeInt32LE(1, FIELD_BYTES);
  fields.writeInt32LE(columns, FIELD_BYTES * 2);
  fields.writeInt32LE(byteOffset, FIELD_BYTES * 5);
  const length = Buffer.alloc(FIELD_BYTES);
  length.writeInt32LE(nameBytes.length);
  return Buffer.concat([length, nameBytes, Buffer.alloc(padding), fields]);
};

describe(readShaderConstantLayouts, () => {
  test("reads records laid end to end as one layout, and one far past them as another", () => {
    expect.hasAssertions();

    const data = Buffer.concat([
      createRecord("_Tint", 3, 0),
      createRecord("_TransientAgePercent", 1, 12),
      Buffer.alloc(64),
      createRecord("_Far", 4, 16),
    ]);

    expect(readShaderConstantLayouts(data)).toStrictEqual([
      [
        { arrayLength: 0, byteOffset: 0, columns: 3, name: "_Tint", rows: 1 },
        { arrayLength: 0, byteOffset: 12, columns: 1, name: "_TransientAgePercent", rows: 1 },
      ],
      [{ arrayLength: 0, byteOffset: 16, columns: 4, name: "_Far", rows: 1 }],
    ]);
  });
});
