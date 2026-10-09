import { InvalidOperationError, Operation } from "@esposter/shared";

const PAGE_SIZE_REGEX = /page size of (?<pageSize>\d+) bytes/u;
const PAGE_LINE_REGEX = /^(?<label>Pages [a-z]+):\s+(?<count>\d+)\.$/u;
// Free memory plus what macOS hands back on demand: the inactive, speculative and purgeable pages
const RECLAIMABLE_PAGE_LABELS: ReadonlySet<string> = new Set([
  "Pages free",
  "Pages inactive",
  "Pages purgeable",
  "Pages speculative",
]);

// The bytes `vm_stat` reports available, as its page counts times the page size it names in its header
export const parseVmStat = (output: string): number => {
  const pageSize = PAGE_SIZE_REGEX.exec(output)?.groups?.pageSize;
  if (pageSize === undefined)
    throw new InvalidOperationError(Operation.Read, "vm_stat", "reports no page size in its header");
  const pageCount = output.split("\n").reduce((total, line) => {
    const { count, label } = PAGE_LINE_REGEX.exec(line.trim())?.groups ?? {};
    return label !== undefined && RECLAIMABLE_PAGE_LABELS.has(label) ? total + Number(count) : total;
  }, 0);
  return pageCount * Number(pageSize);
};
