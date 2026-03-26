import React from 'react';

const CameraView = ({ overlay }) => (
  <div style={{ position:'relative', background:'#000', borderRadius:'16px', overflow:'hidden', aspectRatio:'16/9', border:'1px solid rgba(255,255,255,0.08)' }}>
    <img
      src="/api/video_feed"
      alt="Live camera feed"
      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
    />
    {overlay && (
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px', background:'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
        {overlay}
      </div>
    )}
  </div>
);

export default CameraView;
