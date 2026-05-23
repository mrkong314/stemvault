export const YEAR_LEVELS = [7, 8, 9, 10, 11, 12] as const;
export type YearLevel = (typeof YEAR_LEVELS)[number];
