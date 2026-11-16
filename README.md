# template-3d — «Болашақ химиядан басталады» (3D scroll portfolio)

Saved from the Kozhagulov chemistry site (Desktop\Мико, published at
https://zanylsynsalimanova-bit.github.io/kozhagulov/). No build step, no Node: plain HTML + Three.js 0.160 from jsdelivr.

## Files
| File | What it does | What to change for a new teacher |
|---|---|---|
| `index.html` | All visible text (6 sections), nav, document dialog | name, headline, about text + 4 facts, approach text + steps, gallery cards (student diplomas), final text, footer, Drive folder link |
| `style.css` | Palette `#031615 / #47D8DE / #D2FF24`, layout, mobile, static fallback | colours in `:root` only if the subject needs another mood |
| `main.js` | Content data + scroll logic: `DOCS` (document viewer), `TL` (timeline), hero zoom (`FLASK`), section heights (`data-h` in HTML) | `DOCS`, `TL`, `FLASK` = normalised point on the background image to zoom into |
| `scene3d.js` | One WebGL world: foreground glass molecules, dive cut, micro-world, H₂O 104.5°, lattice gate, gallery panes, light-line timeline (8 nodes), final gather | `YEARS` array (timeline labels) must match `TL` in main.js; for another subject swap the H₂O model/labels |
| `serve.ps1` | Local preview server | — |

## Assets (put real files, clear names)
- `assets/photos/lab-hero-bg.webp` — 16:9 lab scene without the person (ring, flask…)
- `assets/photos/teacher-cutout.webp` — teacher with transparent background
- `assets/students/*.jpg` — student diplomas; `assets/docs/*.jpg` — certificates, programmes, orders

## Rules that made this version work
- Never invent awards, %, names. Unverified handwritten names → show the result without the name.
- Wording follows the proof type: programme = "бағдарламаға енгізілген", order = "жұмыс тобына енгізілген".
- Reduced motion / no WebGL → `html.static` layout with all content (test with `?static`).
- Screenshots of the hidden browser pane lag after programmatic scroll — verify with JS state, then screenshot twice.
- Bump `?v=N` on css/js at every publish (publish-site.ps1 does it).

## Commands
```powershell
cd C:\Users\Жанылсын\Documents\portfolio-kit\scripts
.\new-3d-portfolio.ps1 -Target C:\Users\Жанылсын\Desktop\NewTeacher -Background C:\path\bg.webp -Cutout C:\path\teacher.png
powershell -ExecutionPolicy Bypass -File C:\Users\Жанылсын\Desktop\NewTeacher\serve.ps1 -port 8092
.\publish-site.ps1 -Dir C:\Users\Жанылсын\Desktop\NewTeacher -Repo surname
```
