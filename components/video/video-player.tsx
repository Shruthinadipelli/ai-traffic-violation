"use client"

export function VideoPlayer() {
  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Live Camera Feed</h3>
        <p className="text-sm text-slate-300">Traffic violation detection video demonstration</p>
      </div>
      
      <div className="p-6 bg-slate-50 flex justify-center">
        <video
          width="100%"
          maxWidth="800"
          controls
          className="rounded-lg bg-black"
          style={{ maxWidth: "800px" }}
        >
          <source src="http://localhost:5000/video" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}
