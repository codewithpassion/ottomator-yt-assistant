#!/bin/bash

# Check if video ID is provided
if [ -z "$1" ]; then
    video_id="Vv60TO2XmMU"
    # echo "Error: Please provide a YouTube video ID"
    # echo "Usage: ./get-transcript.sh VIDEO_ID"
    # exit 1
else 
    video_id=$1
fi

# Validate video ID format (11 characters, alphanumeric plus underscore and hyphen)
if [[ ! $video_id =~ ^[a-zA-Z0-9_-]{11}$ ]]; then
    echo "Error: Invalid video ID format. Must be 11 characters long and contain only letters, numbers, underscores, or hyphens."
    exit 1
fi

# Make the API request
curl -s \
    -H "Authorization: Bearer aaa" \
    "http://localhost:8787/api/transcript/$video_id" \
    | jq '.'

# curl -s \
#     -H "Authorization: Bearer aaa" \
#     "http://localhost:8787/api/video-info/$video_id" \
#     | jq '.'


# Check if curl request was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to make the API request. Make sure the local server is running."
    exit 1
fi

