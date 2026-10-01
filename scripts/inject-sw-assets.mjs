import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const swPath = join(distDir, 'sw.js')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(full))
    } else {
      files.push(full)
    }
  }

  return files
}

const files = await walk(distDir)
const assets = files
  .map((file) => relative(distDir, file).split(sep).join('/'))
  .filter((file) => file !== 'sw.js' && file !== '_headers')
  .map((file) => `/${file}`)
  .sort()

let sw = await readFile(swPath, 'utf8')
const replacement = `const PRECACHE = ${JSON.stringify(assets, null, 2)} // __PRECACHE_ASSETS__`

if (!sw.includes('// __PRECACHE_ASSETS__')) {
  throw new Error('Service worker precache marker was not found.')
}

sw = sw.replace(
  /const PRECACHE = .*?\/\/ __PRECACHE_ASSETS__/,
  replacement,
)

await writeFile(swPath, sw, 'utf8')
console.log(`PWA precache injected: ${assets.length} files`)
