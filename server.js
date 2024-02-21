// Example src:
// https://github.com/bluwy/create-vite-extra/blob/master/template-ssr-vue/server.js

import fs from 'node:fs/promises'
import express from 'express'
import process from 'node:process'
import 'dotenv/config'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || (isProduction ? 4173 : 5173)
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/static/index.html', 'utf-8') : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/static/.vite/ssr-manifest.json', 'utf-8')
  : {}

// Create http server
export const createServer = async () => {
  const server = express()

  // Add Vite or respective production middlewares
  let vite
  if (!isProduction) {
    const { createServer } = await import('vite')

    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    vite = await createServer({
      server: {
        middlewareMode: true,
        fs: { deny: ['.env', '.env.*', '*.{crt,pem}', 'plants.js'] }
      },
      appType: 'custom',
      base
    })

    // Use vite's connect instance as middleware. If you use your own
    // express router (express.Router()), you should use router.use
    // When the server restarts (for example after the user modifies
    // vite.config.js), `vite.middlewares` is still going to be the same
    // reference (with a new internal stack of Vite and plugin-injected
    // middlewares). The following is valid even after restarts.
    server.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    server.use(compression())
    server.use(base, sirv('./dist/static'))
  }

  // Create API endpoint to receive plants data from Contentful.
  server.get('/api/plants', async (req, res) => {
    const query = `{ 
    plantCollection {
      items {
        sys {
          id
        }
        commonName
        scientificName
        image {
          url
          description
        }
        wateringSchedule
        lastWatered
        sunlight
        happiness
      }
    }
  }`

    const fetchPlants = async () => {
      try {
        return await fetch(
          `https://graphql.contentful.com/content/v1/spaces/${process.env.VITE_CONTENTFUL_SPACE_ID}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.VITE_CONTENTFUL_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
          }
        )
          .then((response) => response.json())
          .then((json) => json?.data?.plantCollection?.items)
      } catch (error) {
        throw new Error('Could not receive the data from Contentful!\n' + error)
      }
    }

    const plants = await fetchPlants()

    res.send(plants)
  })

  // Serve HTML
  server.use('*', async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, '')

      let template
      let render
      if (!isProduction) {
        // Always read fresh template in development
        // 1. Read index.html
        template = await fs.readFile('./index.html', 'utf-8')

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
        //    and also applies HTML transforms from Vite plugins, e.g. global
        //    preambles from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template)

        // 3a. Load the server entry. ssrLoadModule automatically transforms
        //    ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render

        // 3b. Since Vite 5.1, you can use createViteRuntime API instead.
        //    It fully supports HMR and works in a simillar way to ssrLoadModule
        //    More advanced use case would be creating a runtime in a separate
        //    thread or even a different machine using ViteRuntime class

        /* const runtime = await vite.createViteRuntime(server)
      render = (await runtime.ssrLoadModule('/src/entry-server.js')).render */
      } else {
        template = templateHtml
        render = (await import('./dist/server/entry-server.js')).render
      }

      // 4. render the app HTML. This assumes entry-server.js's exported
      //    `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const [appHtml, preloadLinks] = await render(url, ssrManifest)

      // 5. Inject the app-rendered HTML into the template.
      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml ?? '')

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return server
}

// Start http server
export const server = await createServer().then((server) => {
  const app = server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })

  return { app, port }
})
