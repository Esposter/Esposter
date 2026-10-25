// A destination with a space or a bracket in it is wrapped in angle brackets, which CommonMark reads as one destination
export const formatDestination = (href: string) => (/[\s()<>]/.test(href) ? `<${href}>` : href);
