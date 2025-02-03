# Youtube Assistant - an oTTomator agent entry to the Hackaton

## Agent

The agent is a n8n agent - based on Claude Haiku - but you can probably just swap that for any other modal that can do structured output and tool calling.

### Features

- Add yt video transcripts to a Supabase vector store
- Get summaries of the videos
- Ask follow up questions to the videos
- Search videos that have been previously been added


### Dependencies

- Claude Haiku
- Supabase
- Helper API endpoint (see bellow)

### Required configuration setup

- Credentials for Agent0
- Credentials for helper api endpoint
- URL for helper API endpoint
- create the 'videos' table in Supabase via `supabase.table.sql`


## Helper API edpoint

This is a easy little endpoint in typescript based on Bun - setup to deploy to Cloudflare.

### How to run it

```
cd helper-endpoint
cp .dev.vars.example .dev.vars
<edit .dev.vars to add your API keys>
bun run dev
```

Now you have a local endpoint at http://localhost:8787

### How to publish to cloudflare

To deploy to Cloudflare, make sure you have a (free) account on Cloudflare. 
That will allow you to publish serverless functions - called workers.

You will need a `Youtube Data API v3` API key!


**To login:**
```
cd helper-endpoint
bunx wrangler login
```

**To Deploy**
```
bun run deploy
bunx wrangler secret put BEARER_AUTH_TOKEN
[enter a secret value at the pormpt - this is the auth  token that needs to match the Header Auth for the Transcript enpoint]
bunx wrangler secret put YOUTUBE_API_KEY
[enter a API KEY value at the pormpt]
```

Then after run 
```
bun run deploy
```
again to make sure the new API key values are used.
