import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

// A static attribute by its name, as UnoCSS's attributify mode reads a utility
const getStaticAttribute = (name: string) => `VAttribute[directive=false][key.name=${name}]`;
const LAYOUT_ATTRIBUTE = getStaticAttribute(
  String.raw`/^(?:inline-flex|flex|gap-\d+|items-center|justify-center|py-\d+|min-h-8)$/`,
);

// Template utilities that render nothing or fight the library. A selector's regex is Rust's, so its escapes are
// Written raw
export const RESTRICTED_UTILITY_SYNTAXES: SelectorBanList = {
  bans: [
    {
      // UnoCSS extracts a bare bracket attribute as a class token, so the rule it emits is a `.class` the element
      // Never carries; only the valued form `prop="[...]"` produces an attribute selector
      message: 'Write an arbitrary value in the valued form, `w="[1rem]"`, never the bare `w-[1rem]` attribute.',
      selector: `${getStaticAttribute(String.raw`/\[/`)}[value=null]`,
    },
    {
      // A button and a list row lay out their own content: the flex row, its gap and alignment, the block padding and
      // The control height are the `ui-button`, `ui-item` and `ui-row` shortcuts', so a call site restating one is a
      // Second copy that drifts, and one written in the default layer beats the shortcut's (`ui-library` skill)
      message:
        "Don't restate the layout a button or a list row lays out itself (`ui-button`, `ui-item`, `ui-row`). See the ui-library skill.",
      selector: [
        `VElement[rawName=/^(?:UiButton|UiButtonLink|UiIconButton)$/] > VStartTag > ${LAYOUT_ATTRIBUTE}`,
        `VStartTag:has(${getStaticAttribute("/^ui-(?:button|item|row)$/")}) > ${LAYOUT_ATTRIBUTE}`,
        `VStartTag:has(${getStaticAttribute("/^ui-(?:item|row)$/")}) > ${getStaticAttribute("'px-2'")}`,
      ].join(", "),
    },
  ],
  files: [],
  isTemplate: true,
};
