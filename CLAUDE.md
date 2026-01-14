# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run start:dev      # Development with hot reload
npm run start          # Production mode
npm run build          # Compile TypeScript to dist/

npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting

npm run test           # Run unit tests
npm run test:watch     # Tests in watch mode
npm run test -- --testPathPattern=user  # Run specific test file
npm run test:e2e       # E2E tests (config: test/jest-e2e.json)
npm run test:cov       # Coverage report
```

## Architecture Overview

This is a NestJS 11 REST API with JWT authentication, TypeORM/MySQL, and Swagger documentation.

### Module Structure

Each domain module follows this pattern:

- `*.module.ts` - Module definition with imports/providers/exports
- `*.controller.ts` - HTTP route handlers
- `*.service.ts` - Business logic
- `repositories/*.repository.ts` - Custom repository wrapping TypeORM `Repository<T>`
- `entities/*.entity.ts` - TypeORM entities
- `dto/*.dto.ts` - Request/response DTOs with class-validator decorators

Modules: `auth`, `user`, `board` (all under `src/`)

### Authentication Flow

- Global `JwtAuthGuard` protects all routes by default
- Use `@Public()` decorator to make endpoints publicly accessible
- Use `@Roles('admin')` with `RolesGuard` for role-based access
- Access authenticated user with `@CurrentUser()` decorator
- Dual JWT strategy: access tokens + refresh tokens (stored in User entity)

### Global Configuration

**main.ts** sets up:

- `ValidationPipe` with whitelist/forbidNonWhitelisted/transform
- `SuccessInterceptor` wraps all responses in `{ success: true, timestamp, data }`
- Global `JwtAuthGuard`
- Swagger at `/api`

**Exception Filters** (registered in AppModule):

- `HttpExceptionFilter` - Handles HTTP exceptions
- `InternalServerErrorFilter` - Catches unhandled errors

### Environment Variables

Required `.env` variables (validated via `src/common/config/env.validation.ts`):

- `NODE_ENV`, `PORT`
- `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION`

### Code Patterns

- Repositories inject TypeORM `Repository<T>` via `@InjectRepository()` and expose custom methods
- DTOs use `class-validator` decorators; Swagger metadata is auto-generated via `@nestjs/swagger` CLI plugin
- Use `src/` absolute imports (e.g., `import { UserModule } from 'src/user/user.module'`)

## Code Review & Refactoring Guidelines

When reviewing or modifying this project, follow these principles:

- Treat this project as a **junior backend developer’s NestJS project intended for real-world usage**, not just a tutorial.
- Always review the **entire file and module context**, not isolated code snippets.

### NestJS Best Practices

- Follow idiomatic NestJS patterns (Controller / Service / Module separation).
- Prefer real-world patterns over simplified examples.
- Ensure proper usage of Dependency Injection, DTOs, Entities, and Repositories.
- Avoid overloading controllers with business logic.

### Type Safety

- **Avoid using `any`** unless absolutely unavoidable.
- If `any` exists:
  - Explain why it is problematic
  - Propose a concrete, type-safe alternative
  - Provide example code
- Ensure DTOs, service return types, and response shapes are fully typed.

### Code Quality

- Enforce clear naming conventions.
- Reduce duplication and improve responsibility separation.
- Flag structures that will cause issues when the project scales.

### Improvement Style

- Point out issues **by file and code location**.
- Always explain **why** something should be changed.
- Prefer **Before / After** code examples.
- Optimize for maintainability and readability over cleverness.

### Goal

The goal is to make this project look like:

> “A real NestJS codebase written by a junior backend developer ready for production”
