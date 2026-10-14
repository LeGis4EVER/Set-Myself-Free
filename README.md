# Set Myself Free — starter web app

A mobile-friendly Progressive Web App (PWA) starter designed to run without a paid ChatGPT plan.

## Features included
- **Tracker:** daily check-ins, a streak counter, private setback notes, reflections, recent check-in history, and JSON export.
- **Written advice:** starter articles plus private custom notes. Edit `content.js` to add your own articles.
- **AI advice giver:** clearly marked as requiring setup. It is not connected to an AI service in this version.
- **Stories & strategies:** private drafts saved on this device. Nothing is publicly shared.
- **About:** editable creator story, saved on this device.
- Responsive Android/mobile design, home-screen install support, and basic offline caching when hosted over HTTPS.

## Run it for free
### Quick local preview
Opening `index.html` directly may work for basic UI, but service-worker/offline installation requires `localhost` or HTTPS.
If you have Python installed on a computer, open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in a browser on that computer. To test on your Android phone, the phone and computer must be on the same Wi-Fi and you need the computer's local IP address; the service worker will not install over a plain LAN HTTP address on Android. For a phone-first workflow, use free HTTPS hosting below.

### Free public hosting with GitHub Pages
1. Create/sign in to a GitHub account and create a new repository, for example `set-myself-free`.
2. Upload all files from this folder to the repository root (keep the filenames and folders unchanged).
3. In repository **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish. The URL is typically `https://YOUR-USERNAME.github.io/set-myself-free/`.
5. Open that HTTPS URL in Chrome on Android. Use Chrome's menu → **Add to Home screen** or **Install app** if offered.

Free-hosting product terms and account requirements can change; check the host's current terms. Do not include personal secrets or API keys in files uploaded to a public repository.

## Privacy and data
- Tracker entries, notes, stories, and the About text are saved in browser `localStorage` on the current device/browser.
- Data is not synced between devices. Clearing browser site data can delete it.
- Use **Export my data** on the tracker page to download a JSON backup periodically.
- Private stories and reflections can contain sensitive information. Avoid adding names, contact details, explicit details, or anything you would not want someone with access to your phone/browser profile to see.
- The first version does not include accounts, a server database, community posting, or an AI API connection.

## Adding your advice
Edit `content.js`. Add another object to `window.SMF_ADVICE`:
```js
{
  id: "my-article",
  category: "habits", // "urges", "setbacks", or "habits"
  icon: "🌿",
  title: "Your article title",
  body: "Your article text. Use \\n\\n to separate paragraphs."
}
```
Keep advice non-shaming and make it clear that different strategies work for different people.

## Before adding AI or public sharing
- Never put an AI provider's secret API key in `app.js`, `content.js`, or any other public client-side file.
- Add a server-side endpoint or trusted serverless function to protect the key and enforce limits.
- Tell users what information is sent to the AI provider and obtain appropriate consent.
- Review provider age requirements, privacy terms, safety features, and free-tier limits before use.
- Public stories require moderation, reporting, privacy controls, and a clear process for harmful content.
- Since this project is intended to support young people, have a trusted adult or qualified professional review safety-sensitive content before public launch.

## Important
This is a starter tool for reflection and encouragement, not medical advice or a substitute for professional support.
