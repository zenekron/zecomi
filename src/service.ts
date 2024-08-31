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

/**
 * A `Service` is an object that is capable of consuming inputs of type `I` and
 * producing outputs of type `O`.
 */
export interface Service<I, O> extends _Service<(input: I) => O> {}

/**
 * A builder for `Service`s, it lets you stack middlewares a fuse them together
 * into new `Service`s.
 */
export class ServiceBuilder<EIn, EOut, IIn, IOut> {
  /**
   * Creates a new `ServiceBuilder` over the provided input and output types.
   */
  public static create<I, O>(): ServiceBuilder<I, O, I, O> {
    return new ServiceBuilder<I, O, I, O>((service) => service);
  }

  /**
   * Same as {@link create} but for `Service`s that return `Promise`s.
   */
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

  /**
   * Add a middleware to the current stack, this middleware will run after all
   * the previously added middlewares.
   */
  public use<I, O>(
    middleware: Middleware<IIn, IOut, I, O>,
  ): ServiceBuilder<EIn, EOut, I, O> {
    return new ServiceBuilder((service) =>
      this.fn({ invoke: (input) => middleware.invoke(input, service) }),
    );
  }

  /**
   * Compiles the previously provided middlewares and the service `service` into
   * a new `Service`.
   */
  public build(service: Service<IIn, IOut>): Service<EIn, EOut> {
    return this.fn(service);
  }
}
