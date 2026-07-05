// One-shot: download every hotlinked image into public/ and repoint the source
// files at the local copies. Idempotent — re-running skips files already on disk
// and re-applies the (already-applied) string replacements harmlessly.
//
//   node scripts/self-host-images.mjs
//
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");

// ── URL → public-relative path map ──────────────────────────────
/** @type {[string, string][]} */
const MAP = [];

// Photography — picsum placeholders (seed → dimensions)
const px = {
  "nl-cover": "1600/1067", nl1: "1600/1067", nl2: "1067/1600", nl3: "1600/1067", nl4: "1600/1067", nl5: "1067/1600", nl6: "1600/1067",
  "studio-cover": "1067/1600", st1: "1067/1600", st2: "1067/1600", st3: "1600/1067", st4: "1067/1600", st5: "1067/1600", st6: "1600/1067",
  "arch-cover": "1600/1067", ar1: "1600/1067", ar2: "1067/1600", ar3: "1600/1067", ar4: "1600/1067", ar5: "1067/1600", ar6: "1600/1067",
  "field-cover": "1600/1067", fn1: "1600/1067", fn2: "1067/1600", fn3: "1600/1067", fn4: "1067/1600", fn5: "1600/1067", fn6: "1600/1067",
};
for (const [seed, dim] of Object.entries(px)) {
  MAP.push([`https://picsum.photos/seed/${seed}/${dim}`, `/photography/${seed}.jpg`]);
}

// Productions — ArtStation (cover==images[0] entries appear once; the string
// replace repoints both occurrences at the same local file).
const as = [
  // mojo-swoptops
  ["https://cdna.artstation.com/p/assets/covers/images/081/561/364/large/alexandre-haineaux-alexandre-haineaux-mojo-profile-pichalf.jpg?1730631317", "/productions/mojo-swoptops/cover.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/081/982/294/original/alexandre-haineaux-jetski.gif?1731755623", "/productions/mojo-swoptops/01.gif"],
  ["https://cdnb.artstation.com/p/assets/images/images/090/990/377/original/alexandre-haineaux-shark.gif?1755521303", "/productions/mojo-swoptops/02.gif"],
  ["https://cdnb.artstation.com/p/assets/images/images/081/981/515/original/alexandre-haineaux-buoy.gif?1731753535", "/productions/mojo-swoptops/03.gif"],
  // azureus
  ["https://cdna.artstation.com/p/assets/covers/images/081/563/682/large/alexandre-haineaux-alexandre-haineaux-azureusprofile-pic.jpg?1730638662", "/productions/azureus/cover.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/081/564/870/large/alexandre-haineaux-untitled-3.jpg?1730642143", "/productions/azureus/01.jpg"],
  ["https://cdnb.artstation.com/p/assets/video_clips/images/081/564/251/large/alexandre-haineaux-thumb.jpg?1730640146", "/productions/azureus/02.jpg"],
  ["https://cdna.artstation.com/p/assets/video_clips/images/081/564/130/large/alexandre-haineaux-thumb.jpg?1730639854", "/productions/azureus/03.jpg"],
  // crown-reinterpretation
  ["https://cdna.artstation.com/p/assets/covers/images/088/420/842/large/alexandre-haineaux-alexandre-haineaux-miniature.jpg?1748265749", "/productions/crown-reinterpretation/cover.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/088/327/156/large/alexandre-haineaux-beauty-shot-blue.jpg?1747992314", "/productions/crown-reinterpretation/01.jpg"],
  ["https://cdnb.artstation.com/p/assets/model3ds/images/088/427/211/large/alexandre-haineaux-5024c32455504308b2e98ba96ad99991.jpg?1748276501", "/productions/crown-reinterpretation/02.jpg"],
  ["https://cdna.artstation.com/p/assets/video_clips/images/088/363/534/large/alexandre-haineaux-thumb.jpg?1748095889", "/productions/crown-reinterpretation/03.jpg"],
  // rambochador
  ["https://cdnb.artstation.com/p/assets/covers/images/061/260/391/large/alexandre-haineaux-alexandre-haineaux-0645.jpg?1680366874", "/productions/rambochador/cover.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/061/153/066/large/alexandre-haineaux-main2.jpg?1680118881", "/productions/rambochador/01.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/061/153/142/large/alexandre-haineaux-soft-gold.jpg?1680118995", "/productions/rambochador/02.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/061/153/146/large/alexandre-haineaux-discomfort.jpg?1680119008", "/productions/rambochador/03.jpg"],
  // chance-parfume
  ["https://cdnb.artstation.com/p/assets/video_clips/images/061/801/479/large/alexandre-haineaux-thumb.jpg?1681673744", "/productions/chance-parfume/cover.jpg"],
  ["https://cdnb.artstation.com/p/assets/images/images/061/876/209/large/alexandre-haineaux-untitled2.jpg?1681836749", "/productions/chance-parfume/01.jpg"],
  ["https://cdna.artstation.com/p/assets/video_clips/images/061/801/494/large/alexandre-haineaux-thumb.jpg?1681673779", "/productions/chance-parfume/02.jpg"],
  // vermouth-rosso (cover == images[0])
  ["https://cdna.artstation.com/p/assets/images/images/091/863/020/large/alexandre-haineaux-eucalyptus-02-2-1.webp?1758027978", "/productions/vermouth-rosso/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/091/862/999/large/alexandre-haineaux-studio01-2.webp?1758027938", "/productions/vermouth-rosso/01.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/091/863/022/large/alexandre-haineaux-bureau-01-dust.webp?1758027982", "/productions/vermouth-rosso/02.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/091/863/222/large/alexandre-haineaux-barrel-01png.webp?1758028315", "/productions/vermouth-rosso/03.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/091/863/522/large/alexandre-haineaux-copie-de-label-basecolor.webp?1758028821", "/productions/vermouth-rosso/04.webp"],
  // half-moon-eau-de-parfum (cover == images[0])
  ["https://cdnb.artstation.com/p/assets/images/images/099/013/509/large/alexandre-haineaux-bottle08.webp?1778688849", "/productions/half-moon-eau-de-parfum/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/013/541/large/alexandre-haineaux-bottle08-2.webp?1778688897", "/productions/half-moon-eau-de-parfum/01.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/013/527/large/alexandre-haineaux-bottle08wireframe.webp?1778688872", "/productions/half-moon-eau-de-parfum/02.webp"],
  // avocado-lms-bio (cover == images[0])
  ["https://cdna.artstation.com/p/assets/images/images/099/007/296/large/alexandre-haineaux-bottle07.webp?1778676963", "/productions/avocado-lms-bio/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/007/349/large/alexandre-haineaux-bottle07-2.webp?1778676998", "/productions/avocado-lms-bio/01.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/007/461/large/alexandre-haineaux-bottle07wireframe-2.webp?1778677202", "/productions/avocado-lms-bio/02.webp"],
  // emperor-orange-lime (cover == images[0])
  ["https://cdnb.artstation.com/p/assets/images/images/099/006/309/large/alexandre-haineaux-bottle05.webp?1778675000", "/productions/emperor-orange-lime/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/006/325/large/alexandre-haineaux-bottle06compressed.webp?1778675054", "/productions/emperor-orange-lime/01.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/006/321/large/alexandre-haineaux-bottle05wireframecompressed.webp?1778675034", "/productions/emperor-orange-lime/02.webp"],
  // lulu-acidoactive (cover == images[0])
  ["https://cdnb.artstation.com/p/assets/images/images/099/003/585/large/alexandre-haineaux-bottle04.webp?1778669286", "/productions/lulu-acidoactive/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/099/003/587/large/alexandre-haineaux-bottle04-01.webp?1778669296", "/productions/lulu-acidoactive/01.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/099/003/592/large/alexandre-haineaux-bottle04wireframe.webp?1778669305", "/productions/lulu-acidoactive/02.webp"],
  // riesling-luxembourg (cover == images[0])
  ["https://cdna.artstation.com/p/assets/images/images/098/939/448/large/alexandre-haineaux-untitledcompressed.webp?1778511006", "/productions/riesling-luxembourg/cover.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/098/940/132/large/alexandre-haineaux-wireframecompressed.webp?1778512130", "/productions/riesling-luxembourg/01.webp"],
  // l-u-x-proaging (cover == images[0])
  ["https://cdna.artstation.com/p/assets/images/images/098/975/298/large/alexandre-haineaux-bottle01.webp?1778597643", "/productions/l-u-x-proaging/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/098/975/303/large/alexandre-haineaux-bottle01wireframe.webp?1778597627", "/productions/l-u-x-proaging/01.webp"],
  // natuargua-collection-844 (cover == images[0])
  ["https://cdna.artstation.com/p/assets/images/images/098/977/336/large/alexandre-haineaux-bottle03.webp?1778601191", "/productions/natuargua-collection-844/cover.webp"],
  ["https://cdna.artstation.com/p/assets/images/images/098/977/342/large/alexandre-haineaux-bottle03wireframe.webp?1778601143", "/productions/natuargua-collection-844/01.webp"],
  // 91-1-herbal-serum (cover == images[0])
  ["https://cdnb.artstation.com/p/assets/images/images/098/976/591/large/alexandre-haineaux-bottle02.webp?1778599717", "/productions/91-1-herbal-serum/cover.webp"],
  ["https://cdnb.artstation.com/p/assets/images/images/098/976/595/large/alexandre-haineaux-bottle02wireframe.webp?1778599727", "/productions/91-1-herbal-serum/01.webp"],
  // carl-fredricksen
  ["https://cdnb.artstation.com/p/assets/covers/images/029/407/435/large/alexandre-haineaux-alexandre-haineaux-65054277f7b041f691ff820c64188899.jpg?1597433242", "/productions/carl-fredricksen/cover.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/028/648/885/large/alexandre-haineaux-visage1-basecolor.jpg?1595084935", "/productions/carl-fredricksen/01.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/028/648/888/large/alexandre-haineaux-visage1-normal.jpg?1595084941", "/productions/carl-fredricksen/02.jpg"],
  ["https://cdna.artstation.com/p/assets/images/images/028/648/882/large/alexandre-haineaux-visage1-roughness.jpg?1595084931", "/productions/carl-fredricksen/03.jpg"],
  // about avatar
  ["https://cdna.artstation.com/p/users/avatars/000/649/046/large/304a0d74e7b1c17d7f491f0262228c33.jpg?1716481400", "/about/avatar.jpg"],
];
MAP.push(...as);

// ── Download ────────────────────────────────────────────────────
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

let downloaded = 0, skipped = 0;
const failures = [];

for (const [url, rel] of MAP) {
  const dest = path.join(PUB, rel);
  if (await exists(dest)) { skipped++; continue; }
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://www.artstation.com/" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error("empty body");
    await writeFile(dest, buf);
    downloaded++;
    process.stdout.write(`  ✓ ${rel} (${(buf.length / 1024).toFixed(0)} KB)\n`);
  } catch (err) {
    failures.push([url, rel, String(err)]);
    process.stdout.write(`  ✗ ${rel} — ${err}\n`);
  }
}

console.log(`\nDownloaded ${downloaded}, skipped ${skipped}, failed ${failures.length}`);
if (failures.length) {
  console.error("Failures — NOT rewriting source files:");
  for (const [url, , why] of failures) console.error(`  ${why}  ${url}`);
  process.exit(1);
}

// ── Rewrite source files ────────────────────────────────────────
const files = [
  "src/data/photography.ts",
  "src/data/three-d.ts",
  "src/components/about/ProfileBlock.tsx",
];

for (const f of files) {
  const abs = path.join(ROOT, f);
  let text = await readFile(abs, "utf8");
  let n = 0;
  for (const [url, rel] of MAP) {
    if (text.includes(url)) { text = text.split(url).join(rel); n++; }
  }
  await writeFile(abs, text, "utf8");
  console.log(`  rewrote ${f} — ${n} url(s) repointed`);
}

console.log("\nDone.");
