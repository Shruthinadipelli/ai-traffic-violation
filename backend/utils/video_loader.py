"""
video_loader.py - Video File Loader
====================================
Utility to download and manage video files for the demonstration.
"""

import os
import requests
from pathlib import Path


def ensure_video_file(input_folder: str, video_filename: str = "video.mp4") -> bool:
    """
    Ensure the video file exists in the input folder.
    If it doesn't exist, attempt to download it from the blob storage.
    
    Args:
        input_folder: Path to the input folder where video should be stored
        video_filename: Name of the video file (default: video.mp4)
    
    Returns:
        bool: True if video file exists or was successfully created, False otherwise
    """
    video_path = os.path.join(input_folder, video_filename)
    
    # If file already exists, we're good
    if os.path.exists(video_path):
        return True
    
    # Create directory if it doesn't exist
    Path(input_folder).mkdir(parents=True, exist_ok=True)
    
    # Try to download from blob storage
    blob_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/red_light_violation-iHA7FY96EK548tkQJk8stGzcjmRdN.mp4"
    
    try:
        print(f"[v0] Downloading video from blob storage...")
        response = requests.get(blob_url, timeout=30)
        response.raise_for_status()
        
        # Write the video file
        with open(video_path, 'wb') as f:
            f.write(response.content)
        
        print(f"[v0] Video file successfully saved to {video_path}")
        return True
        
    except Exception as e:
        print(f"[v0] Warning: Could not download video file: {e}")
        print(f"[v0] Video file should be manually placed at: {video_path}")
        return False
