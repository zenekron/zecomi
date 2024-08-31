import type { Middleware } from "./middleware.js";

/**
 * This "trick" ensures that the type of `input` is properly treated as
 * contravariant.
 *
 * @see {@link ./service.test-d.ts}
 */
interface _Service<T extends (...args: never[]) => unknown> {
  invoke: T;
}

export interface Service<I, O> extends _Service<(input: I) => O> {}

export class ServiceBuilder<EIn, EOut, IIn, IOut> {
  public static create<I, O>(): ServiceBuilder<I, O, I, O> {
    return new ServiceBuilder<I, O, I, O>((service) => service);
  }

  public static createAsync<I, O>(): ServiceBuilder<
    I,
    Promise<O>,
    I,
    Promise<O>
  > {
    return new ServiceBuilder((service) => service);
  }

  private constructor(
    private readonly fn: (service: Service<IIn, IOut>) => Service<EIn, EOut>,
  ) {}

  public use<I, O>(
    middleware: Middleware<IIn, IOut, I, O>,
  ): ServiceBuilder<EIn, EOut, I, O> {
    return new ServiceBuilder((service) =>
      this.fn({ invoke: (input) => middleware.invoke(input, service) }),
    );
  }

  public build(service: Service<IIn, IOut>): Service<EIn, EOut> {
    return this.fn(service);
  }
}
