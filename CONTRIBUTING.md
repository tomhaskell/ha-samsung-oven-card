# Contributing

Contributions are welcome, especially if you have a different model oven to test on.

## Development

The easiest way to test changes to this custom card is to serve it locally and the point your live Home Assistant instance at it.

1. Serve the JS file locally:

   ```bash
   npx serve ./src -l 5000 --cors
   ```

   _Ensure the server sends CORS headers (`--cors`) or HA's web frontend will block the script_

2. Add the resource to Home Assistant:
   - In HA, navigate to **Settings > Dashboards > Three dots (top right) > Resources**
   - Click Add Resource
   - Set URL to `http://<YOUR_IP>:5000/samsung-oven-card.js`
   - Set Resource Type to JavaScript Module

3. Add the card to a test dashboard:
   - Create a manual card in your dashboard

   ```yaml
   type: custom:samsung-oven-card
   device: <oven-device-id>
   ```

   _You can find your device id by navigating to the LocalThings device page and copying the id from the URL._

4. Browsers aggressively cache Lovelace JavaScript resources. When you update your code:
   - Do a hard refresh in your browser (Cmd + Shift + R).
   - If the browser still hangs onto the old bundle, add a cache-busting query parameter in Settings > Resources (e.g. .../my-custom-card.js?v=2).

## Building

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build and minify the bundle:

   ```bash
   npm run build
   ```

   This generates the production bundle at `dist/samsung-oven-card.js`.

3. For live rebuilding during development:
   ```bash
   npm run watch
   ```

A GitHub Actions workflow automatically builds and minifies the code on every push to `main` and publishes `dist/samsung-oven-card.js`.
