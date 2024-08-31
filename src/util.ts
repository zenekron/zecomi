/**
 * Resolves to `true` if the provided types are equal.
 */
export type IsEqual<L, R> = ((arg: L) => L) extends (arg: R) => R
  ? ((arg: R) => R) extends (arg: L) => L
    ? true
    : false
  : false;
