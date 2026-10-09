// Git's MSYS tools live in a `usr\bin` folder of the Git install, and each runs under the MSYS process table
export const checkIsMsysExecutable = (executablePath: string): boolean => /\\usr\\bin\\[^\\]+$/iu.test(executablePath);
