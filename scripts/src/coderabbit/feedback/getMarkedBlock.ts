// The walkthrough's merge-risk verdict and pre-merge checks sit inside collapsed `<details>` blocks carrying no
// Counted heading, so nothing in the line filter would reopen for them. The `_start`/`_end` HTML-comment pairs
// Are machine-written and stable, which makes them the only reliable way in.
export const getMarkedBlock = (body: string, marker: string): string | undefined => {
  const start = body.indexOf(`<!-- ${marker}_start -->`);
  const end = body.indexOf(`<!-- ${marker}_end -->`);
  return start === -1 || end === -1 ? undefined : body.slice(start, end);
};
