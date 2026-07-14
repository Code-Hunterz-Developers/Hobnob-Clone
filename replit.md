# Sweet Treats Bakery

A bakery e-commerce web app: a React/Vite frontend backed directly by Firebase (Auth, Firestore). There is no application server — the browser talks to Firebase directly, gated by Firestore security rules.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (`src/`)
- **Auth**: Firebase Authentication (email/password) — gates `/admin`
- **Data**: Cloud Firestore — `categories`, `products`, `orders` collections (`src/lib/api/`)
- **Images**: no Firebase Storage (requires the paid Blaze plan) — images are compressed client-side and stored inline as base64 data URLs on the Firestore doc itself (`src/lib/api/image.ts`)
- **Firebase config**: `src/lib/firebase.ts`

## How to Run

Dependencies are managed with plain npm.

```sh
npm install
npm run dev       # starts the Vite dev server (frontend + Firebase, nothing else to run)
npm run build     # production build
npm run typecheck
```

## Data Setup

Firestore starts empty. To seed the initial catalog (5 categories, 14 products) with their images embedded:

1. Firebase Console → Project Settings → Service Accounts → "Generate new private key"
2. Save the downloaded file as `scripts/serviceAccountKey.json` (gitignored)
3. `npm run seed`

The admin account (used to log in at `/admin/login`) is created directly in the Firebase Console under Authentication → Users, not by this app.

## Security Rules

`firestore.rules` defines access: catalog data is public-read, admin-write (any authenticated user); orders can be created and fetched by ID by anyone (needed for anonymous checkout + order tracking), but only listed/updated by an authenticated admin.

## User Preferences
