// A method is allowed when it is listed, compared as HTTP compares methods, which is case-sensitively
export const checkIsMethodAllowed = (method: string, methods: string[]): boolean => methods.includes(method);
