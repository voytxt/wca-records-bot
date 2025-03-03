# WCA Records Bot [@wca.voytxt.com](https://bsky.app/profile/wca.voytxt.com)

cron-job.org calls a vercel serverless function every 10 mins, that gets the latest records from the wca live api and the prev records from the appwrite db and if there's a new record, it creates an image of the record (via npm canvas) and posts it to bluesky

originally i tried to use deno instead of node, but it just didn't want to work... deno deploy doesn't let you change files, which was needed in all canvas libs i tried (both from jsr and npm), and the vercel deno support is too outdated for anything to work properly

i also tried to use npm @napi-rs/canvas instead of npm canvas, but for some weird reason, it doesn't render fonts at all on the server (https://github.com/Brooooooklyn/canvas/issues/731); npm canvas doesn't support rem as units, woff2 fonts, and is slower, but at least the text rendering works

## How to run locally?

0. Requirements: nodejs and pnpm installed
1. Add enviroment variables (create a `.env` file in the root directory): BSKY_PASSWORD and APPWRITE_API_KEY
2. Run `pnpm i`
3. Run `pnpx vercel dev`
4. Navigate to `localhost:3000/api/main` to run `api/main.ts`
