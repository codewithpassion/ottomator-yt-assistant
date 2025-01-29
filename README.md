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