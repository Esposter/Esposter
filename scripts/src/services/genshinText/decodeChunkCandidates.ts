import { getResult } from "@esposter/shared";

export type ChunkDecode = { ok: false; reasons: string[] } | { ok: true; textMap: Map<string, string> };

// Decodes one text map chunk from the first of its candidate rows the decoder accepts. The index lists a chunk's name
// Beside any other asset that shares it, so a row the decoder refuses is passed over and its reason kept, and a chunk no
// Row decodes returns with every reason it was refused for
export const decodeChunkCandidates = <TCandidate>(
  candidates: readonly TCandidate[],
  decodeCandidate: (candidate: TCandidate) => Map<string, string>,
): ChunkDecode => {
  const reasons: string[] = [];
  for (const candidate of candidates) {
    const decode = getResult(() => decodeCandidate(candidate)).match<ChunkDecode | undefined>(
      (textMap) => ({ ok: true, textMap }),
      ({ message }) => {
        reasons.push(message);
        return undefined;
      },
    );
    if (decode) return decode;
  }
  return { ok: false, reasons };
};
