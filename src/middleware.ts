import type { Service } from "./service.js";
import type { IsEqual } from "./util.js";

export interface Middleware<I, O, IInput, IOutput> {
  invoke(input: I, next: Service<IInput, IOutput>): O;
}

export type MiddlewareChain<I, O, IInput, IOutput> =
  | (IsEqual<[I, O], [IInput, IOutput]> extends true ? [] : never)
  | [Middleware<I, O, IInput, IOutput>]
  | [
      Middleware<I, O, unknown, unknown>,
      ...Middleware<unknown, unknown, unknown, unknown>[],
      Middleware<unknown, unknown, IInput, IOutput>,
    ];

export function mergeMiddlewareChains<I, O, II, OO, IInput, IOutput>(
  a: MiddlewareChain<I, O, II, OO>,
  b: MiddlewareChain<II, OO, IInput, IOutput>,
): MiddlewareChain<I, O, IInput, IOutput> {
  return [...a, ...b] as MiddlewareChain<I, O, IInput, IOutput>;
}
