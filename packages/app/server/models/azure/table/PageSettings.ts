/**
 * An interface that tracks the settings for paged iteration
 */
export interface PageSettings {
  /**
   * The token that keeps track of where to continue the iterator
   */
  continuationToken?: string;
  /**
   * The size of the page during paged iteration
   */
  maxPageSize?: number;
}
