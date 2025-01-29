import { Hono } from 'hono'
// import { YoutubeTranscript } from 'youtube-transcript'
import { YoutubeTranscript } from './yt'
import { Context, Env } from 'hono'


interface AppType extends Env {
  Bindings: {
    BEARER_AUTH_TOKEN: string
    YOUTUBE_API_KEY: string
  }
}

const app = new Hono<AppType>()

// Auth middleware to check bearer token
async function authMiddleware(c: Context<AppType>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Missing or invalid authorization header'
    }, 401)
  }

  const token = authHeader.split(' ')[1]
  if (token !== c.env.BEARER_AUTH_TOKEN) {
    return c.json({
      success: false,
      error: 'Invalid authorization token'
    }, 401)
  }

  await next()
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

interface YouTubeVideoSnippet {
  title: string
  channelTitle: string
  description: string
}

interface YouTubeApiResponse {
  items?: Array<{
    snippet: YouTubeVideoSnippet
  }>
}

interface VideoInfoResponse {
  success: boolean
  data?: {
    title: string
    channelName: string
    description: string
  }
  error?: string
}

interface TranscriptResponse {
  success: boolean
  data?: {
    transcript: Array<{
      text: string
      duration: number
      offset: number
    }>,
    videoInfo: {
      title: string
      channelName: string
      description: string
    }
  }
  error?: string
}

async function fetchVideoInfo(videoId: string, apiKey: string): Promise<VideoInfoResponse> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  )

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data = await response.json() as YouTubeApiResponse

  if (!data.items || data.items.length === 0) {
    return {
      success: false,
      error: 'Video not found'
    }
  }

  const videoDetails = data.items[0].snippet

  return {
    success: true,
    data: {
      title: videoDetails.title,
      channelName: videoDetails.channelTitle,
      description: videoDetails.description
    }
  }
}



app.get('/api/video-info/:videoId', authMiddleware, async (c: Context<AppType>) => {
  const videoId = c.req.param('videoId')

  if (!videoId) {
    return c.json({
      success: false,
      error: 'Video ID is required'
    } as VideoInfoResponse, 400)
  }

  // Validate video ID format
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/
  if (!videoIdRegex.test(videoId)) {
    return c.json({
      success: false,
      error: 'Invalid video ID format'
    } as VideoInfoResponse, 400)
  }

  try {

    const videoInfoResponse = await fetchVideoInfo(videoId, c.env.YOUTUBE_API_KEY)
    if (!videoInfoResponse.success) {
      return c.json(videoInfoResponse, 404)
    }

    return c.json(videoInfoResponse)


  } catch (error) {
    console.error('Error fetching video info:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch video information'
    } as VideoInfoResponse, 500)
  }
})

app.get('/api/transcript/:videoId', authMiddleware, async (c: Context<AppType>) => {
  try {
    const videoId = c.req.param('videoId')

    if (!videoId) {
      return c.json({
        success: false,
        error: 'Video ID is required'
      } as TranscriptResponse, 400)
    }

    // Validate video ID format
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/
    if (!videoIdRegex.test(videoId)) {
      return c.json({
        success: false,
        error: 'Invalid video ID format'
      } as TranscriptResponse, 400)
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    // const transcript = await getYouTubeTranscript(videoId)

    const videoInfoResponse = await fetchVideoInfo(videoId, c.env.YOUTUBE_API_KEY)
    if (!videoInfoResponse.success) {
      return c.json(videoInfoResponse, 404)
    }

    return c.json({
      success: true,
      data: {
        transcript,
        videoInfo: videoInfoResponse.data
      }
    } as TranscriptResponse)

  } catch (error) {
    console.error('Error fetching transcript:', error)

    return c.json({
      success: false,
      error: 'Failed to fetch transcript. Make sure the video exists and has captions available.'
    } as TranscriptResponse, 500)
  }
})

export default app
