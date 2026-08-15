// Zero-dependency static server: serves app/messaging-app.html for every request.
// Node built-in `http` only, on purpose — no Python (this repo is Node-only by
// design, one less thing to install), no npm static-server package, and no manual
// step for whoever runs this: `npx playwright test` starts/stops it via `webServer`
// in playwright.config.ts. fetch() from a page loaded over file:// is unreliable in
// Chromium, hence serving over http:// at all.
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 4173
const FILE = path.join(__dirname, '..', 'app', 'messaging-app.html')

http.createServer((req, res) => {
    fs.readFile(FILE, (err, html) => {
        if (err) {
            res.writeHead(500)
            res.end('Failed to load app')
            return
        }
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(html)
    })
}).listen(PORT, () => console.log(`Static server running at http://localhost:${PORT}`))
