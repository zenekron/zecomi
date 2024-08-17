import {
  type Middleware,
  type MiddlewareChain,
  mergeMiddlewareChains,
} from "./middleware.js";

export interface Service<I, O> {
  invoke(input: I): O;
}

export class ServiceBuilder<I, O, IInput, IOutput> {
  public static create<I, O>(): ServiceBuilder<I, O, I, O> {
    return new ServiceBuilder<I, O, I, O>([]);
  }

  private constructor(
    private readonly middlewares: MiddlewareChain<I, O, IInput, IOutput>,
  ) {}

  public use<II, OO>(
    middleware: Middleware<IInput, IOutput, II, OO>,
  ): ServiceBuilder<I, O, II, OO> {
    return new ServiceBuilder(
      mergeMiddlewareChains(this.middlewares, [middleware]),
    );
  }

  public build(service: Service<IInput, IOutput>): Service<I, O> {
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

    return res as Service<I, O>;
  }
}
