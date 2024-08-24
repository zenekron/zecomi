import {
  type Middleware,
  type MiddlewareChain,
  mergeMiddlewareChains,
} from "./middleware.js";

export interface Service<I, O> {
  invoke(input: I): O;
}

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
    const middlewares: MiddlewareChain<unknown, unknown, unknown, unknown> =
      this.middlewares;

    const res = middlewares.reduceRight<Service<unknown, unknown>>(
      (prev, curr): Service<unknown, unknown> => ({
        invoke(input) {
          return curr.invoke(input, prev);
        },
      }),
      service,
    );

    return res as Service<EIn, EOut>;
  }
}
