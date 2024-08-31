# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/zenekron/zecomi/tag/0.1.0

