// A heading of an email, named by the text block that holds it
export interface EmailHeading {
  // Whether no text is written in the heading, its descendants included
  isEmpty: boolean;
  level: number;
  // The text block that holds the heading
  nodeId: string;
}
