type ServiceFn<I, O> = (input: I) => O;

/**
 * This "trick" ensures that the type of `input` is properly treated as
 * contravariant.
 *
 * @see {@link ./service.test-d.ts}
 */
interface _Service<T extends ServiceFn<never, unknown>> {
  invoke: T;
}

/**
 * A `Service` is an object that is capable of consuming inputs of type `I` and
 * producing outputs of type `O`.
 */
export interface Service<I, O> extends _Service<ServiceFn<I, O>> {}

/**
 * A value that can be converted into a {@link Service} by invoking
 * {@link intoService}.
 */
export type IntoService<I, O> = Service<I, O> | ServiceFn<I, O>;

/**
 * Converts a value of type {@link IntoService} into a {@link Service}.
 */
export function intoService<I, O>(value: IntoService<I, O>): Service<I, O> {
  if ("invoke" in value) return value;
  return { invoke: value };
}
