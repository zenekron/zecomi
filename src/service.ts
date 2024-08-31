import {
  type Middleware,
  type MiddlewareChain,
  mergeMiddlewareChains,
} from "./middleware.js";

/**
 * This "trick" ensures that the type of `input` is properly treated as
 * contravariant.
 *
 * @see {@link ./service.test-d.ts}
 */
interface _Service<T extends (input: never) => unknown> {
  invoke: T;
}

export interface Service<I, O> extends _Service<(input: I) => O> {}

export class ServiceBuilder<EIn, EOut, IIn, IOut> {
  public static create<I, O>(): ServiceBuilder<I, O, I, O> {
    return new ServiceBuilder<I, O, I, O>([]);
  }

  private constructor(
    private readonly middlewares: MiddlewareChain<EIn, EOut, IIn, IOut>,
  ) {}

  public use<I, O>(
    middleware: Middleware<IIn, IOut, I, O>,
  ): ServiceBuilder<EIn, EOut, I, O> {
    return new ServiceBuilder(
      mergeMiddlewareChains(this.middlewares, [middleware]),
    );
  }

  public build(service: Service<IIn, IOut>): Service<EIn, EOut> {
    const middlewares  =
      this.middlewares as MiddlewareChain<unknown, unknown, unknown, unknown>;

    const res = middlewares.reduceRight<Service<unknown, unknown>>(
      (prev, curr): Service<unknown, unknown> => ({
        invoke(input) {
          return curr.invoke(input, prev);
        },
      }),
      service as Service<unknown, unknown>,
    );

    return res as Service<EIn, EOut>;
  }
}
