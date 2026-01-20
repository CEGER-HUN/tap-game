# MineDash — GitHub Pages P2E Demo

This is a frontend-only demo for a simple "send to mine" mechanic:
- Players can register a username + character (stored locally in browser)
- Send the character to mine (default duration: 3 hours)
- Claim resources (gold / iron / coal) when mining finishes
- Gain season points per mine
- Local leaderboard (based on browser localStorage)

Important: This is only a demo to test UX and mechanics. For a real multiplayer/secure game you must add a backend (server-side storage and validation) and, if you want, blockchain/token integration.

How to deploy to GitHub Pages
1. Create a new repository on GitHub (or use an existing one).
2. Add these files to the repository root:
   - index.html
   - style.css
   - script.js
   - README.md
3. Commit and push to the `main` branch (or `master`).
4. In GitHub repository settings -> Pages, enable Pages:
   - Source: `main` branch (root)
   - Save and wait a few moments; GitHub will publish your site under `https://<username>.github.io/<repo>/`
5. Open the URL in your browser.

Testing quickly
- For quick testing, enable "Demo mode" checkbox: mining takes 10 seconds so you can iterate quickly.
- This demo stores all data in your browser's localStorage. If you open the site from another device or clear storage, data will be lost.

Next steps (I can do these for you)
- Add a simple backend (serverless functions) + Supabase/Postgres to persist users and mining jobs.
- Create a Telegram Bot integration so players can login via Telegram and get notifications.
- Add admin panel to start/finish seasons and distribute rewards.
- Add on-chain token/NFT minting (optional).

Tell me which next step you want me to prepare:
A) Make a "one-click deploy" repo with Vercel & Supabase instructions (I will prepare code & README).
B) Create serverless endpoints (start_mine, claim_mine) and Supabase schema next.
C) Create Telegram Bot skeleton that opens the GitHub Pages Web App and links accounts.

Prefer English UI? The demo is already English. I can keep docs in Turkish if you prefer.
