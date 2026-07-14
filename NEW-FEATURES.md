# New features & how to use them

*Added 13 July 2026 — the "media & authoring" upgrade. This file explains
every new capability, what it replaced, and exactly how to use it day to
day. For the beginner-friendly step-by-step recipes see
[UPDATING.md](UPDATING.md); for the technical architecture notes see
[CLAUDE.md](CLAUDE.md).*

A full pre-upgrade backup of the site lives at
`Documents\projects\mysite-BACKUP-2026-07-13` — to roll everything back,
replace this folder's contents with the backup's and run `npm install`.

---

## 1. Project galleries build themselves

**Before:** every project in `src/data/three-d.ts` carried an `images:`
list you had to keep in sync with the files by hand.

**Now:** the project page scans `public/productions/<slug>/` at build
time and shows every **numbered** file it finds — `01.jpg`, `02.webp`,
`03.webm`… — in number order. Images and videos alike.

**How to use it:**

- **Add a picture to a project** → drop `05.jpg` into the project's
  folder, run `npm run images`. Done. Nothing to edit.
- **Remove a picture** → delete the file (and its `-400.webp` etc.
  copies, or just re-run `npm run images` which cleans them up).
- **Reorder** → rename the files (the number is the order).
- **Show the cover as the first gallery image** (all the
  product-visualisation projects do this) → add one line to the project
  block in `src/data/three-d.ts`:

  ```ts
  coverInGallery: true,
  ```

- **Force a custom order** (rare) → the old `images: [...]` list still
  works as an override if a project ever needs a non-numeric order.

Reserved filenames that are **never** shown as gallery items:
`cover.*` (the listing card), `*-poster.jpg` (video posters),
`yt-*.jpg` (YouTube posters), and the auto-generated `-400/-800/…webp`
copies.

---

## 2. Turnaround videos instead of GIFs

**Before:** animations were shipped as animated GIFs — the three Mojo
SwopTops loops alone weighed **2.99 MB** and couldn't be paused.

**Now:** animations are real videos (WebM + MP4 + a poster frame). Same
look — they autoplay silently and loop like a GIF — but the same three
loops now weigh **0.22 MB**, visitors can pause them (click, or
Enter/Space on the keyboard), and people with "reduced motion" enabled
in their system get them paused with player controls instead.

**How to add one:**

```
node scripts/gen-video.mjs public/productions/your-slug/04.gif
npm run images
```

The first command creates `04.webm`, `04.mp4` and `04-poster.jpg` next
to the input. It accepts GIFs and most video formats (a screen capture
`.mov`/`.mp4` from Blender works too). Then:

1. **Delete the original GIF** — the whole point is not to ship it.
2. Preview and publish as usual.

The number in the filename is the position in the gallery, exactly like
an image. No text-file edits needed.

---

## 3. YouTube embeds (for showreels & longer breakdowns)

**New capability** — projects can now show YouTube videos, done in a way
that keeps the site fast and private: the page shows a **self-hosted
preview picture with a play button**, and only contacts YouTube
(privacy-enhanced `youtube-nocookie.com` — fewer cookies/tracking) if a
visitor actually presses play. No layout jump, nothing loaded up front.

**How to add one:**

1. Get the video ID — the part after `watch?v=` in the YouTube address.
2. Download its preview picture into the project folder:

   ```
   node scripts/fetch-yt-poster.mjs your-slug AbCd1234xyz
   npm run images
   ```

3. Add one line to the project's block in `src/data/three-d.ts`:

   ```ts
   youtube: [{ id: "AbCd1234xyz", title: "360° turnaround" }],
   ```

   (Several videos? Put several `{ id, title }` entries in the list.)

4. Preview → publish.

The videos appear after the image gallery, full-width in 16:9.

**Rule of thumb — which to use when:**

| Content | Use |
|---|---|
| Short silent loop (turnaround, 5–15 s) | Self-hosted video (section 2) |
| Long piece, narration, showreel | YouTube embed (section 3) |

*Technical note: the security policy (`public/_headers`) was widened by
exactly one entry — `frame-src https://www.youtube-nocookie.com`.
Self-hosted videos needed no change at all.*

---

## 4. Photography galleries keep the photos' true shape

**Before:** collection pages cropped every photo to a square — a
portrait frame lost about half the image.

**Now:** the gallery is a masonry layout (3 columns → 2 on tablet → 1 on
phone) where every photo keeps its **native aspect ratio**. Portraits
are tall, landscapes are wide, nothing is cropped. Still zero
JavaScript, still no layout jumping while images load.

Nothing to do — it applies automatically to every collection.

---

## 5. No more typing pixel dimensions

**Before:** every photo line in `src/data/photography.ts` needed
`width:` and `height:` numbers copied from Explorer's Properties dialog;
getting them wrong made photos look stretched.

**Now:** a photo line is only the file and its description:

```ts
{ src: "/photography/nl7.jpg", alt: "Fog rolling over the fjord at dawn" },
```

`npm run images` measures every picture and the pages read the real
dimensions automatically. A stretched photo is no longer possible, and
replacing a horizontal photo with a vertical one needs no edits.

---

## 6. Smarter project-page layout

Project pages now arrange media by shape automatically:

- **Landscape** images/videos (wider than ~5:4) span the full width —
  a 1920×1080 render finally gets the space it deserves.
- **Portrait and square** media flow two per row.
- If an odd one would be left alone in a row, a square item is promoted
  to full width so the page never ends on an awkward gap (portraits are
  left half-width on purpose — full-width portraits get far too tall).

Nothing to configure — it reads each file's real dimensions.

---

## 7. Smaller quality-of-life upgrades

- **Lightbox is snappier** — while you view a photo, the next and
  previous ones quietly load in the background, so the arrows feel
  instant.
- **Share cards** (WhatsApp/LinkedIn/etc.) now announce the image's
  exact size, which makes previews render faster and more reliably.
- **Listing cards** use each cover's true dimensions.
- **Toolchain** — the image tool (`sharp`) and the video tool
  (`ffmpeg-static`) are now proper project dependencies: a fresh
  `npm install` on any computer brings everything needed. Dependency
  security fixes were applied (two low-severity dev-only advisories
  remain; their fix is the future Astro 7 upgrade).

---

## Cheat sheet — the new commands

| I want to… | Command |
|---|---|
| Add/replace any picture | drop the file, then `npm run images` |
| Turn a GIF/capture into a web video | `node scripts/gen-video.mjs <file>` |
| Get a YouTube preview picture | `node scripts/fetch-yt-poster.mjs <slug> <id>` |
| See it before publishing | `npm run dev` → http://localhost:4321 |

Everything else (publishing, fixing mistakes) is unchanged — see
[UPDATING.md](UPDATING.md) sections 8–9.
