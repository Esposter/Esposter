import { getTextMapKeyVariant } from "#src/services/genshinText/getTextMapKeyVariant";

// A language's text by hash, which answers a hash by its own entry first and then by the entry under its variant key, since
// The dump's tables file some hashes one bit away from the key their text sits under. Its entries are only the text
// Map's own, so listing or counting them reads no entry twice
export class GameTextMap extends Map<string, string> {
  override get(hash: string): string | undefined {
    const text = super.get(hash);
    if (text !== undefined) return text;

    const variant = getTextMapKeyVariant(hash);
    return variant === undefined ? undefined : super.get(variant);
  }

  override has(hash: string): boolean {
    return this.get(hash) !== undefined;
  }
}
