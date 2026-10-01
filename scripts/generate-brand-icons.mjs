import sharp from 'sharp'

const source = 'public/favicon.svg'
const sizes = [32, 192, 512]

await Promise.all(
  sizes.map((size) =>
    sharp(source, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}.png`),
  ),
)

console.log(`Generated TarikhDaar brand icons: ${sizes.join(', ')}px`)
