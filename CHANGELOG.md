# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-09-04

### Features

- also allow passing `Middleware`s and `Service`s to the `ServiceBuilder` as functions
- export types `IntoMiddleware` and `IntoService`

### Bug Fixes

- provide default types for `ServiceBuilder::use`

### Styling

- apply biome fixes

### Testing

- verify that function middlewares and services behave okay

## [0.2.1] - 2024-08-31

### Bug Fixes

- properly generate versions and git tags

## [0.2.0] - 2024-08-31

### Features

- make the second set of I/O generic parameters optional in middlewares
- create `ServiceBuilder::createAsync` factory

### Documentation

- provide some barebones documentation for the exported types and their methods

## [0.1.1] - 2024-08-31

### Bug Fixes

- only include files in "src" in the published build

## [0.1.0] - 2024-08-31

### Features

- create `AsyncMiddleware` type alias

### Bug Fixes

- covariance and contravariance problems with the `Service` and `Middleware` types

### Documentation

- create README

### Refactor

- avoid casts when building the service

### Testing

- verify that properly typed `Middleware`s preserve type information
- create integration tests
- create middleware assignability tests

[0.3.0]: https://github.com/zenekron/zecomi/compare/v0.2.1..v0.3.0
[0.2.1]: https://github.com/zenekron/zecomi/compare/v0.2.0..v0.2.1
[0.2.0]: https://github.com/zenekron/zecomi/compare/v0.1.1..v0.2.0
[0.1.1]: https://github.com/zenekron/zecomi/compare/v0.1.0..v0.1.1
[0.1.0]: https://github.com/zenekron/zecomi/tag/v0.1.0

