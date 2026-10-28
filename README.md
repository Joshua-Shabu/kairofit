# Grow — habit tracker website

Plain HTML/JS (no build step) — the full Grow tracker: habits, plan & calendar, gym, diet, Bible study, journal and stats. Supabase handles email-code sign-in and each user's private data.
Without Supabase keys it runs in **demo mode** (no sign-in, data stays on the device).

## Files
| File | What it is |
|---|---|
| `index.html` | The whole app (tracker + sign-in screen + backup import/export) |
| `config.js` | Your Supabase URL and anon/publishable key |
| `supabase/schema.sql` | Database table + security rules — run once |
| `supabase/trainer-sharing.sql` | Adds trainer sharing — run once, after schema.sql |
| `manifest.webmanifest`, `sw.js`, `icons/` | "Add to Home Screen" app install + offline support |
| `joshua-grow-backup.json` | Your current tracker data, ready to import (don't upload this to the website host) |

## 1. Set up Supabase (≈10 min)
1. Create a free project at supabase.com.
2. **SQL Editor** → paste `supabase/schema.sql` → Run.
3. **Authentication → Email Templates → Magic Link**: replace the body so it shows the code, e.g.
   ```html
   <h2>Your Grow sign-in code</h2>
   <p style="font-size:28px;letter-spacing:4px"><b>{{ .Token }}</b></p>
   <p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
   ```
   Do the same for **Confirm signup** so brand-new users also get a code instead of a link.
4. **Project Settings → API**: copy the Project URL and the anon (or publishable) key into `config.js`.
5. Before inviting friends: **Authentication → SMTP Settings** → connect a free email service (e.g. Resend).
   Supabase's built-in email is meant for testing and only sends a small number of emails per hour.

## 2. Put it online (free)
Pick one:
- **Netlify Drop** — go to app.netlify.com/drop and drag the folder in (leave out `joshua-grow-backup.json`).
- **Vercel** — `npx vercel` inside the folder.
- **GitHub Pages** — push to a repo, Settings → Pages → deploy from main.

Then in Supabase **Authentication → URL Configuration**, set Site URL to your new website address.

## 3. Move your data over
Open the site → sign in → ⚙ (next to the month) → **Import backup** → choose `joshua-grow-backup.json`.

## 4. Install on a phone
- iPhone (Safari): Share → **Add to Home Screen**
- Android (Chrome): ⋮ menu → **Install app**

## Sharing with a trainer
1. Run `supabase/trainer-sharing.sql` once in the SQL Editor.
2. In Grow: ⚙ → **Trainer access** → enter your trainer's email → Share.
3. Your trainer opens the site and signs in with that email. They land on a **Coaching** screen with your food,
   calories, protein, weight and workouts (Day and Week views). They can assign a workout for any day and leave notes.
4. You see assigned workouts at the top of the Gym tab ("Add these to my workout log") and notes on the Gym and Diet tabs.

The database enforces it: a trainer can read only `config/diet`, `config/gym`, `fit/…` and `coach/…`, and write only `coach/…`.
Journal, Bible, habits, mood, plans and tasks are never readable by anyone else.

## How data is stored
One table, `docs`: one row per user per document — `config/habits`, `config/gym`, `config/diet`, `bible/progress`,
one row per month (`months/2026-09`), diet + workouts per month (`fit/2026-09`), and trainer notes + assigned workouts (`coach/2026-09`). Row-level security means every query only ever sees the
signed-in user's rows; the anon key in `config.js` can't read anyone else's data.
Changes sync live between devices through Supabase Realtime.

## Updating later
When the app changes, replace `index.html` (and bump `CACHE` in `sw.js`) and redeploy — everyone's data stays in Supabase.
