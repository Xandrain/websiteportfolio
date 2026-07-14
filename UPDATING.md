# How to update your website (the simple guide)

This guide explains how to change the words and pictures on
**haineaux.com** yourself. No programming knowledge needed — just follow
the recipes. Read the first two sections once; after that you'll only
ever come back for the recipe you need.

> ✨ New here? [NEW-FEATURES.md](NEW-FEATURES.md) explains the newer
> capabilities (self-building galleries, turnaround videos, YouTube
> embeds) and when to use which.

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

Then open **http://localhost:4321** in your browser. This is a private
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
- `title`, `description`, `category`, `year` — self-explanatory.
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

## 7b. Recipe: add a turnaround video (animation) to a project

Short looping animations (3D turnarounds, GIF-style clips) are shown as
real videos — they autoplay silently, loop, and are ~10× smaller than a
GIF. To add one to a project:

1. In the terminal, run (with your own file path):

   ```
   node scripts/gen-video.mjs public/productions/your-slug/04.gif
   ```

   This creates `04.webm`, `04.mp4` and `04-poster.jpg` next to it.
   (It accepts GIFs and most video files — name the input with the
   number you want it to have in the page order.)
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

---

## 8. Recipe: publish (put your changes on the real website)

When the preview looks right, run these three commands in the terminal,
one after the other:

```
git add -A
git commit -m "swap in new photos"
git push
```

(The part between quotes after `-m` is a note to yourself — write
anything, e.g. "new tagline" or "added fog collection".)

Then wait **about two minutes** — a robot on the internet rebuilds the
site and puts it online. Open haineaux.com and press **Ctrl + F5**
(a "hard refresh" that skips your browser's memory) to see it.

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
- **Leave these alone** unless you know why:
  `public/_headers` (security), everything in `scripts/` and
  `src/components/` (the machinery and the design),
  `package.json` (the parts list), `src/data/img-*.json`
  (auto-generated — never edit by hand).

---

*Cheat sheet: `npm run dev` = preview · `npm run images` = after
changing pictures · `git add -A` + `git commit -m "note"` + `git push`
= publish.*
