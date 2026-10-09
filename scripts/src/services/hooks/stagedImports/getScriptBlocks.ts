// A Vue single-file component's script, every `<script>` block of it joined, since only those hold imports
export const getScriptBlocks = (source: string): string =>
  Array.from(source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g), (match) => match[1] ?? "").join("\n");
