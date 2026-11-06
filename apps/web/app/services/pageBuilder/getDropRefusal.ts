// The line a block no slot takes is refused with while the pointer is over the frame. A block with no title is refused
// silently
export const getDropRefusal = (title: string | undefined) => (title ? `A ${title} can't go here` : "");
