// The engine's tokenizer: a sentence in, the language model's inputs out
export type VoiceProcessor = (text: string) => Promise<Record<string, unknown>>;
