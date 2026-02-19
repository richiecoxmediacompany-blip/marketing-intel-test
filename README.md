# Marketing Intel

A marketing intelligence web app that researches companies and generates detailed reports using Claude AI with real-time web search.

## Features

- Enter any company name or website URL
- AI-powered research using Claude with web search
- Detailed reports covering:
  - Company overview
  - Business model analysis
  - Target market identification
  - Products & services breakdown
  - Top 3-5 competitors
  - Recent news & developments
  - Market position assessment
- Real-time streaming status updates during research
- Clean, professional report layout
- Print/PDF support

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Anthropic API** with web search tool (Claude Sonnet)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Then add your Anthropic API key to `.env`.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/) |
