// Pre-render the app into static HTML.
// run `npm run build` and then `dist/static` can be served as a static site.

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import process from 'node:process'

const isVercel = !!process.env.VERCEL_ENV

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const toAbsolute = (p) => path.resolve(__dirname, p)

const manifest = JSON.parse(
  fs.readFileSync(toAbsolute('dist/static/.vite/ssr-manifest.json'), 'utf-8')
)
const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// Determine routes to pre-render from src/pages.
const routesToPrerender = fs.readdirSync(toAbsolute('src/pages')).map((file) => {
  const name = file.replace(/Page\.vue$/, '').toLowerCase()
  return name === 'home' ? `/` : `/${name}`
})

;(async () => {
  // Start the http server for API to be available during generation.
  // Prevent starting server on Vercel since it has serverless API.
  let app
  let port
  if (!isVercel) {
    ;({
      server: { app, port }
    } = await import('./server.js'))
  }

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

  // Close the http server after static assets generation completes.
  if (!isVercel) {
    app.close()
    console.log(`Server closed at http://localhost:${port}`)
  }
})()
