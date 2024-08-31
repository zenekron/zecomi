import type { Service } from "./service.js";

type _Middleware<T extends (...args: never[]) => unknown> = {
  invoke: T;
};

export interface Middleware<EIn, EOut, IIn, IOut>
  extends _Middleware<(input: EIn, next: Service<IIn, IOut>) => EOut> {}

export interface AsyncMiddleware<EIn, EOut, IIn, IOut>
  extends Middleware<EIn, Promise<EOut>, IIn, Promise<IOut>> {}
