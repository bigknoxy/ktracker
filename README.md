# ktracker

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```


## Architecture Summary

- **Backend:** TypeScript (Bun runtime), PostgreSQL, Prisma ORM
- **Frontend:** React (Vite or Next.js)
- **Auth:** Basic username/password (expandable)
- **API:** RESTful
- **DevOps:** Docker
- **Testing:** TDD (Jest, React Testing Library, etc.)

See `thoughts/plans/mvp_2025_08_26.md` for full implementation plan.

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
