# TarikhDaar 6

TarikhDaar is an open-source, offline-first date converter by Mehrdad32.

Temp link to test: https://tarikhdaar.pages.dev/

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

## Windows desktop

TarikhDaar also ships as a lightweight Tauri desktop application.

Local development:

```bash
npm install
npm run desktop:icons
npm run desktop:dev
```

Production Windows build:

```bash
npm run desktop:icons
npm run desktop:build -- --bundles nsis
```

The Windows release workflow publishes:

- an NSIS setup executable;
- a portable executable;
- SHA-256 checksums for release verification.

The first alpha builds are unsigned, so Windows SmartScreen may show a warning.
