import { CharacterCount } from "@tiptap/extensions";

// CharacterCount copies its options into the plugin it builds, so a limit given at mount stays the limit.
// Its plugin is built here with the limit read through a getter, which follows the limit after mount
export const useCharacterCountExtension = (getLimit: () => number) =>
  CharacterCount.extend({
    addProseMirrorPlugins() {
      return (
        CharacterCount.config.addProseMirrorPlugins?.call({
          ...this,
          options: {
            ...this.options,
            get limit() {
              return getLimit();
            },
          },
        }) ?? []
      );
    },
  }).configure({ limit: getLimit() });
