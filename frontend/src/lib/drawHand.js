/** Hand skeleton rendering — glowing lines + joints on a canvas overlay. */

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],        // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],        // index
  [9, 10], [10, 11], [11, 12],           // middle
  [13, 14], [14, 15], [15, 16],          // ring
  [0, 17], [17, 18], [18, 19], [19, 20], // pinky
  [5, 9], [9, 13], [13, 17],             // knuckle bridge
];

const FINGERTIPS = new Set([4, 8, 12, 16, 20]);

/**
 * Draw one hand. ctx must already be scaled/mirrored to match the video.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x,y,z}>} lm normalized landmarks
 * @param {number} w canvas width
 * @param {number} h canvas height
 * @param {boolean} locked highlight when a letter is registering
 */
export function drawHand(ctx, lm, w, h, locked = false) {
  const px = lm.map((p) => [p.x * w, p.y * h]);
  const line = locked ? 'rgba(52,211,153,0.95)' : 'rgba(255,255,255,0.85)';
  const joint = locked ? '#34d399' : '#c9cdd4';

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // bones
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (const [a, b] of CONNECTIONS) {
    ctx.moveTo(px[a][0], px[a][1]);
    ctx.lineTo(px[b][0], px[b][1]);
  }
  ctx.stroke();

  // joints
  for (let i = 0; i < px.length; i++) {
    const tip = FINGERTIPS.has(i);
    ctx.beginPath();
    ctx.arc(px[i][0], px[i][1], i === 0 ? 5.5 : tip ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = tip || i === 0 ? joint : '#ffffff';
    ctx.fill();
  }
  ctx.restore();
}
