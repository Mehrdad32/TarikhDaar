# TarikhDaar 6

TarikhDaar is an open-source, offline-first date converter by Mehrdad32.

## Current Alpha

- Gregorian ↔ Persian (Solar Hijri)
- Gregorian ↔ Hijri (Civil / Tabular)
- Persian / Latin / Arabic-Indic numeral handling
- Hijri ±2 day adjustment
- Local settings persistence
- Responsive web UI
- Fully local conversion; no remote API is required

## Development

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

## Production build

Vite outputs the static site to `dist/`.
