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
    Serve the video file (red_light_violation.mp4) for browser playback.
    Returns the video with appropriate video/mp4 mimetype.
    """
    # Path to the video file in the input folder
    video_path = os.path.join(
        current_app.config.get('INPUT_FOLDER', 'backend/input'),
        'video.mp4'
    )
    
    # Check if file exists
    if not os.path.exists(video_path):
        return {'error': 'Video file not found'}, 404
    
    # Serve the video file with proper mimetype for browser playback
    return send_file(
        video_path,
        mimetype='video/mp4',
        as_attachment=False
    )
