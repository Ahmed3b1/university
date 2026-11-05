# EduLrn - University Management System

A full-stack university management platform built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB (Mongoose)** and **Tailwind CSS 4**.
Three role-based dashboards (admin, professor, student), course enrollment, learning materials, grades, notifications,
graduate programs, online courses and campus events. Ships with **Arabic (RTL)** and **English (LTR)**, and a dark / light theme.

> Full documentation: open **`documentation/index.html`** in your browser.

## Quick start

**Requirements:** Node.js 20.9 or newer, npm, and a MongoDB database
(the free [MongoDB Atlas](https://www.mongodb.com/atlas) tier is enough).

```bash
# 1. install dependencies
npm install

# 2. create your environment file and fill in the two values
cp .env.example .env.local        # Windows: copy .env.example .env.local

# 3. create the first administrator
npm run create-admin

# 4. start the app
npm run dev                        # http://localhost:3000
```

Open `http://localhost:3000/login` and sign in with the admin you just created.

## Environment variables

| Name | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string, including the database name |
| `JWT_SECRET` | yes | Random string (32+ characters) used to sign login tokens |

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run create-admin` | Create an administrator, or promote an existing user to admin |

## Where to change things

| I want to... | File |
|---|---|
| Change colors | `src/app/globals.css` |
| Add or edit English text | `src/lib/i18n/en.ts` |
| Change the default language | `src/lib/i18n/config.ts` |
| Change the logo / site name | `src/components/layout/header.tsx` |

## Deploying

The project deploys to **Vercel** with no extra configuration. Add `MONGODB_URI` and `JWT_SECRET` under
*Project Settings > Environment Variables*, allow Vercel in MongoDB Atlas (*Network Access > Allow access from anywhere*),
then redeploy. Details are in the documentation.

## License

Sold under the Envato Market license. See the item page on CodeCanyon for the Regular and Extended license terms.
Third-party libraries keep their own licenses (listed in the documentation).
