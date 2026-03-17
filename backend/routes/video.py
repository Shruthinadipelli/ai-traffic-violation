"""
video.py - Video Serving Route
================================
Provides a simple endpoint to serve video files for demonstration purposes.
"""

import os
from flask import Blueprint, send_file, current_app

video_bp = Blueprint('video', __name__)


@video_bp.route('', methods=['GET'])
def serve_video():
    """
    Serve the video file (video.mp4) for browser playback.
    Returns the video with appropriate video/mp4 mimetype.
    """
    # Path to the video file in the input folder
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    video_path = os.path.join(backend_dir, '..', 'input', 'video.mp4')
    video_path = os.path.abspath(video_path)
    
    # Check if file exists
    if not os.path.exists(video_path):
        return {'error': 'Video file not found'}, 404
    
    # Serve the video file with proper mimetype for browser playback
    return send_file(
        video_path,
        mimetype='video/mp4',
        as_attachment=False
    )
