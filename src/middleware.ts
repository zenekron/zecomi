import type { Service } from "./service.js";

type MiddlewareFn<EIn, EOut, IIn, IOut> = (
  input: EIn,
  next: Service<IIn, IOut>,
) => EOut;

// biome-ignore lint/suspicious/noExplicitAny: neither `never` nor `unknown` behave as expected
type _Middleware<T extends MiddlewareFn<never, unknown, any, any>> = {
  invoke: T;
};

/**
 * A `Middleware` is a component that sits between a `Service` and the outside,
 * it can observe, manipulate or intercept requests coming from the outside and
 * usually has to rely on the underlying `Service` to process them.
 */
export interface Middleware<EIn, EOut, IIn = EIn, IOut = EOut>
  extends _Middleware<MiddlewareFn<EIn, EOut, IIn, IOut>> {}

/**
 * A {@see Middleware} that returns `Promise`s.
 */
export interface AsyncMiddleware<EIn, EOut, IIn = EIn, IOut = EOut>
  extends Middleware<EIn, Promise<EOut>, IIn, Promise<IOut>> {}

/**
 * A value that can be converted into a {@link Middleware} by invoking
 * {@link intoMiddleware}.
 */
export type IntoMiddleware<EIn, EOut, IIn = EIn, IOut = EOut> =
  | Middleware<EIn, EOut, IIn, IOut>
  | MiddlewareFn<EIn, EOut, IIn, IOut>;

/**
 * Converts a value of type {@link IntoMiddleware} into a {@link Middleware}.
 */
export function intoMiddleware<EIn, EOut, IIn = EIn, IOut = EOut>(
  value: IntoMiddleware<EIn, EOut, IIn, IOut>,
): Middleware<EIn, EOut, IIn, IOut> {
  if ("invoke" in value) return value;
  return { invoke: value };
}
