import { type IntoMiddleware, intoMiddleware } from "./middleware.js";
import { type IntoService, type Service, intoService } from "./service.js";

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
  public use<I = IIn, O = IOut>(
    middleware: IntoMiddleware<IIn, IOut, I, O>,
  ): ServiceBuilder<EIn, EOut, I, O> {
    return new ServiceBuilder((service) =>
      this.fn({
        invoke: (input) => intoMiddleware(middleware).invoke(input, service),
      }),
    );
  }

  /**
   * Compiles the previously provided middlewares and the service `service` into
   * a new `Service`.
   */
  public build(service: IntoService<IIn, IOut>): Service<EIn, EOut> {
    return this.fn(intoService(service));
  }
}
