// One JSON document per line, encoded as bytes for the archive.
// A value JSON cannot hold (a Date, a bigint) has already been turned into its stored form by the caller
export const encodeJsonLines = async function* (rows: AsyncIterable<unknown>): AsyncGenerator<Uint8Array, void> {
  const encoder = new TextEncoder();
  for await (const row of rows) yield encoder.encode(`${JSON.stringify(row)}\n`);
};
