<p>
  <h1 align="center">zecomi</h1>
  <p align="center">
    A simple, general-purpose and type-safe middleware library.
  </p>
</p>

<!--
TODO: stars
<p align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/zenekron/zecomi">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/zenekron/zecomi">
</p>
-->

## Introduction

zecomi's let's you define and compose middlewares in a type-safe fashion while
making no assumptions about inputs, outputs or the type of computation being
performed.

## Usage

```ts
import { type Middleware, type Service, ServiceBuilder } from "zecomi";

class MyMiddleware<I, O> implements Middleware<I, O, I, O> {
  public invoke(input: I, next: Service<I, O>): O {
    // ...
    const output = next.invoke(input);
    // ...
    return output;
  }
}

const myService = ServiceBuilder.create<I, O>()
  .use(new MyMiddleware())
  // ...
  .build((input: I): O => {
    // business logic that generates outputs from inputs
  });
```

You can find more examples in the [`./examples`](./examples) folder.

## Changelog

View the changelog at [CHANGELOG.md](CHANGELOG.md)

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
