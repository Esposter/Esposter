export const TABS_CLASS = "page-tabs";
export const DEFAULT_TAB_COUNT = 2;
export const TABS_CSS = `.${TABS_CLASS}>[role=tablist]{display:flex;gap:0.25rem}.${TABS_CLASS}>[role=tablist]>[role=tab]{padding:0.5rem 1rem;border:0;border-bottom:2px solid transparent;background:none;color:inherit;font:inherit;cursor:pointer}.${TABS_CLASS}>[role=tablist]>[role=tab][aria-selected=true]{border-bottom-color:currentColor}`;
// The tablist pattern: a click or the arrow keys, Home and End select a tab, and only the selected tab is in the tab
// Order, so Tab moves from it into its panel
export const TABS_SCRIPT = `for (const tabsElement of document.querySelectorAll(".${TABS_CLASS}")) {
  const tabElements = [...tabsElement.querySelectorAll(":scope > [role=tablist] > [role=tab]")];
  const select = (selectedTab) => {
    for (const tab of tabElements) {
      const isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !isSelected;
    }
    selectedTab.focus();
  };
  for (const [index, tab] of tabElements.entries()) {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const nextIndex = { ArrowLeft: index - 1, ArrowRight: index + 1, End: tabElements.length - 1, Home: 0 }[event.key];
      if (nextIndex === undefined) return;
      event.preventDefault();
      select(tabElements[(nextIndex + tabElements.length) % tabElements.length]);
    });
  }
}`;
