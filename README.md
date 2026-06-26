# Interview Prep Assistant

AI-powered Chrome extension (Manifest V3) that extracts job descriptions from LinkedIn, Indeed, and Glassdoor, then generates structured interview preparation materials using OpenAI, Anthropic, or Google AI.

## Features

- Job description extraction from supported job boards
- AI-generated technical topics, behavioral questions, company research, interview process, and salary insights
- Encrypted API key storage (Web Crypto AES-GCM)
- Offline-capable history with Chrome Storage API
- Markdown export of saved analyses

## Development

```bash
npm install
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run test     # Run Vitest tests
npm run lint     # ESLint
```

## Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

## Configuration

On first install, the options page opens automatically. Configure:

1. AI provider (OpenAI, Anthropic, or Google AI)
2. API key (encrypted locally)
3. Optional encryption passphrase

## Project Structure

```
src/
├── background/     # Service worker + message handlers
├── content/        # Content scripts + job extractors
├── popup/          # React popup UI
├── options/        # Full-page settings
├── services/       # API client, interview service, cache
└── shared/         # Types, constants, utilities
```

## Security

- API keys are encrypted with AES-GCM before storage
- Keys are never logged or transmitted to third parties (only to your chosen AI provider)
- All external API calls use HTTPS

## License

ISC
