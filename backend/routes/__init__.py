"""
routes/__init__.py
==================
Marks the routes directory as a Python package.
Each blueprint module handles a specific domain of the REST API.

Blueprints:
  - violations  /api/violations   CRUD for traffic violations
  - challans    /api/challans     E-challan management
  - analytics   /api/analytics    Dashboard charts & KPIs
  - detection   /api/detection    Real-time YOLO + OCR pipeline
  - dashboard   /api/dashboard    Unified endpoint for React dashboard
"""
