# How to update your website (the simple guide)

This guide explains how to change the words and pictures on your website
yourself. No programming knowledge needed — just follow the recipes. Read the
first two sections once; after that you'll only ever come back for the recipe
you need.

> **Where the site actually is:** https://websiteportfolio-4ht.pages.dev
> `haineaux.com` is not attached yet — it still redirects to ArtStation. Check
> your published changes at the pages.dev address, not at haineaux.com.
> (Your email, `contact@haineaux.com`, works normally — it is unaffected.)

---

## 1. The two big ideas

**Idea 1 — the website is just a folder of files on your computer.**
The words live in a few text files. The pictures live in normal folders.
You change a file, and the site changes.

**Idea 2 — nothing goes online until you "publish".**
You can experiment as much as you want on your computer. The real
website only changes when you do the Publish step (section 8). So you
can never break the live site by accident while trying things.

---

## 2. The tools (one-time setup on a new computer)

1. **VS Code** — the program you open the site folder with. It edits the
   text files AND has a built-in terminal.
2. **The terminal** — the text window where you type commands. In VS
   Code: menu **Terminal → New Terminal**. When this guide says
   *"run `npm run dev`"*, it means: click in the terminal, type
   `npm run dev`, press Enter.
3. **The site folder** — this folder (`mysite`). In VS Code:
   **File → Open Folder** and pick it.

That's everything.

---

## 3. See your changes before anyone else (do this every time)

In the terminal, run:

```
npm run dev
```

Then open **http://localhost:3100** in your browser. This is a private
preview of the site that only you can see. Keep it open while you work —
every time you save a file, the page updates by itself.

To stop the preview: click in the terminal and press **Ctrl + C**.

> ⚠️ **Golden rule:** always look at the preview before publishing.

---

## 4. Recipe: change some text

Almost every word on the site lives in just **three files**:

| What you want to change | File to open |
|---|---|
| Your name, job title, tagline, email, location, social links | `src/consts.ts` |
| Photography collection titles & descriptions | `src/data/photography.ts` |
| Design / 3D project titles & descriptions | `src/data/three-d.ts` |

Open the file in VS Code, find the text (Ctrl + F searches), and change
**only the words between the quotation marks**. For example:

```ts
tagline: "Light, form, and the space between.",
```

Change the words inside `"..."`. Don't delete the quotes, the `:` or the
`,` at the end — those are the "grammar" the site needs. Save the file
(Ctrl + S) and check the preview.

---

## 5. Recipe: replace a photo (the easiest update of all)

Say you want to swap a placeholder photo for a real one.

1. Look in `src/data/photography.ts` to find the photo's filename, e.g.
   `/photography/nl1.jpg` → the file is `public/photography/nl1.jpg`.
2. Export your new photo as a JPG, **rename it to exactly that same
   name** (`nl1.jpg`), and copy it into `public/photography/`,
   replacing the old file. (A good export size: about 1600–2500 pixels
   on the long side.)
3. In the terminal, run:

   ```
   npm run images
   ```

   This makes the small fast-loading copies of your photo
   (the `nl1-400.webp`, `nl1-800.webp`… files — see section 10) and
   measures its size automatically — a photo can never show up
   stretched or squashed, even if the new one is a different shape.
4. Check the preview, then publish.

---

## 6. Recipe: add a new photo to an existing collection

1. Copy your photo into `public/photography/`. Give it a simple
   name, all lowercase, no spaces: `nl7.jpg` ✅  `My Photo (2).jpg` ❌
2. Open `src/data/photography.ts`, find the collection, and look at its
   `photos:` list. Copy one existing line and paste it below, then edit
   it:

   ```ts
   { src: "/photography/nl7.jpg", alt: "Fog rolling over the fjord at dawn" },
   ```

   - `src` — `/photography/` + your filename.
   - `alt` — one short sentence describing the photo. It's read aloud
     to blind visitors and read by Google. Just say what's in the picture.

   (That's all — the photo's pixel size is measured automatically by
   the next step.)
3. Run `npm run images` in the terminal.
4. Check the preview, then publish.

**To remove a photo:** delete its whole `{ ... },` line from the list.
(You can also delete the image files from the folder, but nothing breaks
if you don't.)

---

## 7. Recipe: add a whole new collection or project

**New photography collection** — in `src/data/photography.ts`, copy an
entire existing block, from its opening `{` down to its closing `},`,
paste it at the bottom of the list (just before the final `];`), and
edit everything:

- `slug` — the web address part: `"morning-fog"` becomes
  `haineaux.com/photography/morning-fog`. Lowercase, dashes instead of
  spaces, no accents.
- `title`, `description`, `category` — self-explanatory. (There is no year
  field: the site shows no dates on projects.)
- `cover` — the image shown on the overview page.
- `photos` — the list of photos (recipe 6 for each line).

**New design / 3D project** — same game in `src/data/three-d.ts`: copy
an existing project block and edit it. Three things to know:

- `category` must be exactly `"productions"` or
  `"product-visualisation"` — it decides which of the two tabs the
  project appears under.
- Its images live in their own folder:
  `public/productions/your-slug/` with the files named `cover.jpg`,
  `01.jpg`, `02.jpg`, … **You never list them in the text file** — the
  project page finds every numbered file in the folder by itself, in
  number order. Adding or removing a picture later = adding or deleting
  a file in that folder (then `npm run images`).
- If you want the cover picture to also appear as the first image on
  the project page (the product-visualisation projects do this), add
  the line `coverInGallery: true,` to the project block.

Then as always: `npm run images` → preview → publish.

---

## 7b. Recipe: add an animation (turnaround, loop) to a project

Short looping animations play by themselves on the project page, silently
and forever, with a click to pause. Never put a `.gif` on the site — one
of the two commands below always replaces it.

**Which command depends on one thing: does the animation have a
see-through background?** Turnarounds exported from a 3D app usually do
(the model floats, with no white card behind it). If you are unsure, run
this and read the answer:

```
node -e "require('sharp')('public/productions/your-slug/04.gif').stats().then(s=>console.log(s.isOpaque?'opaque':'transparent'))"
```

**Transparent** — keep the see-through background:

```
node scripts/gen-anim.mjs public/productions/your-slug/04.gif
```

Creates `04.webp` (the animation) and `04-poster.webp` (its still). It throws
nothing away — the result is usually smaller than the GIF anyway — and it keeps
the see-through background.

**Several turnarounds in one project?** Put them all on the same clock, or
they will spin out of step with each other:

```
node scripts/gen-anim.mjs --cadence=150 --total-ms=3300 public/productions/your-slug/01.webp public/productions/your-slug/02.webp
```

The project page admits turnarounds on a shared beat, so a row that scrolls
into view holds and spins together instead of each tile doing its own thing.
It can only do that for animations whose laps are the same length — a lap
length is what puts two of them on the same clock in the first place — so give
the whole set one `--total-ms`. Re-running this on files already on the clock
changes nothing.

The beat is per *arrival*, not page-wide: tiles revealed by the same scroll
start together, while a row already spinning keeps the phase it started on.
That is deliberate — aligning a latecomer to the running set would mean
parking it on a still for up to a full lap, which reads as a broken image.
The guardrail in [CLAUDE.md](CLAUDE.md) has the measurements.
To see what you have (swap in your slug):

```
node -e "const s=require('sharp'),f=require('fs'),d='public/productions/your-slug';for(const n of f.readdirSync(d).filter(n=>/^\d+\.webp$/.test(n)).sort())s(d+'/'+n,{animated:true}).metadata().then(m=>console.log(n,(m.delay||[]).reduce((a,b)=>a+b,0)+'ms'))"
```

Every line must print the same number of ms.

**The see-through background is the whole reason.** Video cannot carry it: the
encoder accepts the setting and then silently drops it, so the render arrives on
the page as a white box. (A long "hold" at the end of a loop is *not* a reason —
video reproduces that fine. Only transparency forces this choice.)

**Opaque** — a screen capture, or footage with a real background:

```
node scripts/gen-video.mjs public/productions/your-slug/04.gif
```

Creates `04.webm`, `04.mp4` and `04-poster.jpg`. Add
`--webm-crf=18 --mp4-crf=16` if the result looks blotchy on large flat
areas (3D renders often do).

Then, either way:

1. Name the input with the number you want it to have in the page order.
2. Delete the original `04.gif` — the whole point is not to ship it.
3. Run `npm run images`, check the preview, publish. Nothing to edit in
   the text files — the numbered files are found automatically.

---

## 7c. Recipe: add a YouTube video to a project

For longer pieces (showreels, breakdowns) hosted on your YouTube
channel:

1. Grab the video's ID — the part after `watch?v=` in its address,
   e.g. `https://www.youtube.com/watch?v=`**`AbCd1234xyz`**.
2. In the terminal, run (with your project's slug and the ID):

   ```
   node scripts/fetch-yt-poster.mjs your-slug AbCd1234xyz
   npm run images
   ```

   This saves the video's preview picture into the project folder, so
   your page stays fast and private — YouTube is only contacted if a
   visitor actually presses play.
3. In `src/data/three-d.ts`, add one line to the project block:

   ```ts
   youtube: [{ id: "AbCd1234xyz", title: "360° turnaround" }],
   ```

4. Preview, then publish.

## 7d. Recipe: add a showreel to a project

A showreel is different from the little looping animations: it is an
edited piece, usually with music or voice, and it should **not** start
by itself. Yours plays only when a visitor presses the play button, so
nobody downloads a minute of video just for passing by.

1. Put your video file somewhere outside the website folder (your
   Downloads folder is fine) and rename it to `reel.mp4`.
2. In the terminal, run (with your project's slug):

   ```
   node scripts/gen-video.mjs --audio --mp4-crf=27 --out-dir=public/productions/your-slug "<path to your video>"
   npm run images
   ```

   This writes the video and a still picture used as the preview into the
   project folder. **Keep the source outside the project folder** — the tool
   refuses to run if it sits where the outputs go, because that would destroy
   your original.

   **Delete the `.webm` file it also creates.** Every browser in use plays the
   `.mp4`, so the second copy is roughly 13 MB of dead weight kept forever in
   the project's history.

   **Check the size before you publish** — this one is permanent:

   ```
   ls -l public/productions/your-slug/reel.mp4
   ```

   Aim for **under 15 MB**. Cloudflare refuses any single file over 25 MB, so an
   oversized reel does not merely bloat the repository, it fails the publish
   outright. At 1080p that budget is roughly 90 seconds. A longer film belongs
   on YouTube (recipe 7c) instead.

3. The preview picture is taken from the very first frame, which on an
   edited film is often black or a title card. To use a nicer moment —
   say 5 seconds in — run:

   ```
   node scripts/poster-at.mjs public/productions/your-slug/reel.mp4 5
   npm run images
   ```

4. Preview, then publish. There is nothing to edit in
   `src/data/three-d.ts` — the page picks the reel up from the folder.
   If you want a caption other than "Showreel" over the preview, add one
   line to the project block:

   ```ts
   reelCaption: "Showreel 2024",
   ```

---

## 7e. Recipe: check the menu still reads over a new cover

Only for **Graphic Design & 3D** covers (`cover.*`), and only because that page
is unusual: on `/productions` the pictures run the full width of the screen and
slide up **underneath** the menu as you scroll. Nothing sits between them any
more — no white strip, on purpose. The menu bar and the Productions / Product
Visualisation bar are frosted glass, and that frost is the only thing keeping
the words readable.

So a very pale, very bright or very busy cover can wash the menu out. It never
shows in a screenshot of the top of the page, because it only happens **while
scrolling**.

The check, once, after adding or swapping a cover:

1. `npm run dev`, open `/productions`.
2. Scroll slowly, all the way down and back up, watching the words
   **Photography** and **About** in the top bar — they are the palest, so they
   go first.
3. Do it again with the browser window made narrow (phone width).

If a word gets hard to read against the picture behind it, don't touch the
picture — the fix is in `src/components/Nav.astro` and
`src/components/shared/SubNav.astro`, where the frost is set to `0.86` and
`0.9`. Nudge those up. Going the other way — thinning them — has to be measured
properly first; the method is written down in CLAUDE.md, under "The nav pills
carry their own contrast".

---

## 8. Recipe: publish (put your changes on the real website)

When the preview looks right, first **look at what you are about to publish**:

```
git status
```

Read the list. It should contain only files you meant to change. Then:

```
git add -A
git commit -m "swap in new photos"
git push
```

(The part between quotes after `-m` is a note to yourself — write
anything, e.g. "new tagline" or "added fog collection".)

Then wait **about a minute** — GitHub rebuilds the site and uploads it to
Cloudflare. To check that it actually worked:

```
gh run list --limit 1
```

A green `success` against your commit means it is live. Then open
**https://websiteportfolio-4ht.pages.dev** and press **Ctrl + F5** (a "hard
refresh" that skips your browser's memory).

---

## 9. When something breaks (it will — it's fine)

- **The preview shows an error page instead of the site.** You probably
  deleted a quote, comma, or bracket while editing. The error page names
  the file and line number. Go look — the fix is almost always putting
  back a missing `"` or `,`. The live site is NOT affected.
- **"I changed something and everything looks wrong and I want to go
  back."** This throws away ALL your edits since your last publish:

  ```
  git restore .
  ```

  ⚠️ Only run it when you truly want to abandon everything unsaved.
- **A picture I added isn't showing** → you probably forgot
  `npm run images`, or the filename has spaces/capitals. Rename it
  simple-and-lowercase, run the command, check again.
- **The live site doesn't show my change** → wait 2 minutes, then
  Ctrl + F5. Still nothing? The publish robot may have failed — ask for
  help (below).
- **"I published something broken and need the old site back NOW."**
  Two steps, in this order:
  1. **Stop the bleeding.** In the Cloudflare dashboard: Workers & Pages →
     `websiteportfolio` → Deployments → find the last good build → **Rollback**.
     That re-serves a build which was already uploaded, instantly, with no
     rebuild — so it works even when the broken thing is the build itself.
  2. **Make the code agree.** Back in the terminal:

     ```
     git revert <commit>
     git push
     ```

     Skip this and your next publish quietly re-deploys the broken version.
- **Anything else** → open this folder in Claude Code, describe the
  problem in plain words ("I added a photo and the page went blank"),
  and let it fix it. That's a completely normal way to work.

---

## 10. Things to know but never touch

- **The `-400.webp`, `-800.webp`… files** next to your photos are
  made automatically by `npm run images` — small copies so phones don't
  download huge files. Never edit or rename them by hand; the command
  refreshes and cleans them up on its own. (If you ever forget to run
  it, the publish robot runs it for you too.)
- **Never run `scripts/self-host-images.mjs`.** It looks like a harmless
  leftover. It is not: it overwrites pictures in `public/` and rewrites your
  project text files. It was a one-time job, and it is already done.
- **Never turn a see-through animation into a video** (recipe 7b). The tool
  accepts it and the result is a white box on the page.
- **Leave these alone** unless you know why:
  `public/_headers` (security), everything in `scripts/` and
  `src/components/` (the machinery and the design),
  `package.json` (the parts list), `src/data/img-*.json`
  (auto-generated — never edit by hand).

---

## Cheat sheet

| I want to… | Command |
|---|---|
| Preview while working | `npm run dev` → http://localhost:3100 |
| Add or replace any picture | drop the file, then `npm run images` |
| See-through animation → web | `node scripts/gen-anim.mjs <file>` |
| Opaque animation/capture → web | `node scripts/gen-video.mjs <file>` |
| Same, keeping every pixel | add `--webm-crf=18 --mp4-crf=16` |
| Showreel (with sound) | `node scripts/gen-video.mjs --audio --mp4-crf=27 --out-dir=… <file>` |
| Pick a nicer preview frame | `node scripts/poster-at.mjs <video> <seconds>` |
| YouTube preview picture | `node scripts/fetch-yt-poster.mjs <slug> <id>` |
| Publish | `git status` → `git add -A` → `git commit -m "note"` → `git push` |
| Did it work? | `gh run list --limit 1` |

Files that are **never** shown as gallery items: `cover.*` (the listing card),
`reel.*` (the showreel), `*-poster.*` (preview stills), `yt-*.jpg` (YouTube
posters), and the auto-generated `-400.webp` / `-800.webp` … copies.

Photo dimensions are measured automatically by `npm run images` — you never type
pixel sizes into the text files, and a photo can never appear stretched.
