import type { Service } from "./service.js";

type _Middleware<T extends (...args: never[]) => unknown> = {
  invoke: T;
};

/**
 * A `Middleware` is a component that sits between a `Service` and the outside,
 * it can observe, manipulate or intercept requests coming from the outside and
 * usually has to rely on the underlying `Service` to process them.
 */
export interface Middleware<EIn, EOut, IIn = EIn, IOut = EOut>
  extends _Middleware<(input: EIn, next: Service<IIn, IOut>) => EOut> {}

/**
 * A {@see Middleware} that returns `Promise`s.
 */
export interface AsyncMiddleware<EIn, EOut, IIn = EIn, IOut = EOut>
  extends Middleware<EIn, Promise<EOut>, IIn, Promise<IOut>> {}
