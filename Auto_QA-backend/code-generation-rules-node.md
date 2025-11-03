# 🛠️ Code Generation Rules for Node.js + Express + TypeScript Backend Projects

### 🔰 Target Stack

This rule file is for **Node.js backend applications using Express and TypeScript**. These rules define the expected standards during code generation.

---

## Constraints

- ⚠️ Code should blend into an existing live project. DO NOT modify existing flow, project structure, or global behavior.

---

## ✅ General Coding Standards

Ensure that generated code adheres to the following:

- Use **proper indentation and formatting**
- Apply **consistent naming conventions** (camelCase for variables/methods, PascalCase for classes)
- **Avoid hardcoding** any text or message — use centralized language or message files
- Use `env.json or aws secret manager` files for **all sensitive or environment-specific configuration**
- Add **multi-line documentation** for methods, classes, and business logic
- Do **not generate unused code**, variables, or files
- Utility/helper functions must be created inside reusable modules
- Define strict **TypeScript interfaces/models** for data structures
- Always **log errors** using sentry and make sure to log info on every step for debugging and in log error in every catch block
- Field validations should be **centralized** in reusable validation layers
- Generated code must **use strict equality operators** (`===`, `!==`)
- Avoid inline logic in routes — **use controllers and services layers**

---

## 🚀 Express & Node-Specific Rules

Apply the following Express.js and Node.js coding conventions:

- Integrate **ESLint** with preconfigured rulesets
- Use **feature-based folder structure** (routes/controllers/services grouped by module)
- Define route paths using **lowercase and hyphens**
- Store all configuration, secrets, and URLs in `env,json` or secret manager
- Use **Promises and async/await** for all async operations
- Generate reusable **API middleware** for logging, auth, and validation
- Ensure **Swagger/OpenAPI documentation** is created for all APIs
- Implement **JWT authentication** with a unique and secure key
- Prevent query injection by using **parameterized queries or ORM protections**
- Avoid full-file imports — **import only required members**
- every api must have **validation through joi** for body, params and query data as per api
- Use correct HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- Use middleware for **auth validation** on protected routes
- Use **permission middleware** also as per route restrictions
- Define **separate models for each database table**

---

## 🟦 TypeScript Rules

Enforce strong TypeScript practices during code generation:

- Use `camelCase` for function names and variable names
- Use `Id`, `3d`, `2d` (not `ID`, `3D`, etc.)
- Use `undefined` over `null`
- Prefer `===` and `!==` to `==` and `!=`
- Use **double quotes** (`"`) consistently for strings
- End all statements with **semicolons**
- Avoid use of `any` unless explicitly justified
- Follow strict compiler options and linting aligned with enterprise TypeScript setups
- Provide in-code comments when TypeScript rules are intentionally disabled

---

## 📦 Package & Dependency Management

- make sure **newly installed package is compatible with current node version**
- the **code you generate or methods or classes you use should be compatible with respective version** in my package.json
- Validate each package's use with **clear file-level references**

---

## 🧪 Testing & Error Handling

- Generate testable code (modular functions, dependency injection where applicable)
- All errors must be handled through **centralized error handler**
- Return consistent API responses using standard structure (e.g., `{ success, message, data }`)

---

## 🧠 AI Awareness (Optional)

- Tag AI-generated sections if relevant
- Prefer human-readable, maintainable output over obfuscated or overly compressed code
- ⚠️ Code should blend into an existing live project. DO NOT modify existing flow, project structure, or global behavior.
- We currently have a swagger setup in the project, use the same for further code generation also if need to update any swagger doc do that as per the changes you do in current api

---

## 📁 Output Folder Structure Example

```
src/
├── config/
├── db/
├── interface/
├── middleware/
├── features/
    ├── <%%feature-name%%>/
        ├── controller.ts
        ├── services.ts
        ├── validation.ts
        ├── interface.ts
        ├── routes.ts
├── prompts/
├── schema/
├── swagger/
├── types/
├── utils/
└── App.ts
```

---

## 📝 Final Deliverables Checklist

- [ ] Code follows all rules above
- [ ] Readable, modular, and properly commented
- [ ] Project contains working `README.md`
- [ ] `.env.example` is provided
- [ ] No console logs or test artifacts in final output
- [ ] Type safety is enforced throughout
