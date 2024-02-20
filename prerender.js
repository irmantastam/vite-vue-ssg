// Pre-render the app into static HTML.
// run `npm run generate` and then `dist/static` can be served as a static site.

import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

// Constants
const port = process.env.PORT || 5173

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const toAbsolute = (p) => path.resolve(__dirname, p)

const manifest = JSON.parse(
  fs.readFileSync(toAbsolute('dist/static/.vite/ssr-manifest.json'), 'utf-8')
)
const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// determine routes to pre-render from src/pages
const routesToPrerender = fs.readdirSync(toAbsolute('src/pages')).map((file) => {
  const name = file.replace(/Page\.vue$/, '').toLowerCase()
  return name === 'home' ? `/` : `/${name}`
})

;(async () => {
  // Start http server
  const {
    server: { app, vite }
  } = await import('./server.js')

  // pre-render each route...
  for (const url of routesToPrerender) {
    const [appHtml, preloadLinks] = await render(url, manifest)

    const html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(toAbsolute(filePath), html)
    console.log('pre-rendered:', filePath)
  }

  // done, delete .vite directory including ssr manifest
  fs.rmSync(toAbsolute('dist/static/.vite'), { recursive: true })

  // Close the http server after generation.
  app.close()
  vite.close()
  console.log(`Server closed at http://localhost:${port}`)
})()
