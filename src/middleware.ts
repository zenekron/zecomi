import type { Service } from "./service.js";
import type { IsEqual } from "./util.js";

export interface Middleware<EIn, EOut, IIn, IOut> {
  invoke(input: EIn, next: Service<IIn, IOut>): EOut;
}

export interface AsyncMiddleware<EIn, EOut, IIn, IOut>
  extends Middleware<EIn, Promise<EOut>, IIn, Promise<IOut>> {}

export type MiddlewareChain<EIn, EOut, IIn, IOut> =
  | (IsEqual<[EIn, EOut], [IIn, IOut]> extends true ? [] : never)
  | [Middleware<EIn, EOut, IIn, IOut>]
  | [
      Middleware<EIn, EOut, unknown, unknown>,
      ...Middleware<unknown, unknown, unknown, unknown>[],
      Middleware<unknown, unknown, IIn, IOut>,
    ];

export function mergeMiddlewareChains<EIn, EOut, MIn, MOut, IIn, IOut>(
  a: MiddlewareChain<EIn, EOut, MIn, MOut>,
  b: MiddlewareChain<MIn, MOut, IIn, IOut>,
): MiddlewareChain<EIn, EOut, IIn, IOut> {
  return [...a, ...b] as MiddlewareChain<EIn, EOut, IIn, IOut>;
}
