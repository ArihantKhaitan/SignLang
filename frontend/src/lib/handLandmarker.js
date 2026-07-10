import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/**
 * Create a MediaPipe HandLandmarker running fully in the browser.
 * Wasm runtime and model are served from /public — no network needed.
 * Tries the GPU delegate first, falls back to CPU.
 */
export async function createHandLandmarker(numHands = 1) {
  const fileset = await FilesetResolver.forVisionTasks('/wasm');
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: '/models/hand_landmarker.task', delegate },
    runningMode: 'VIDEO',
    numHands,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  try {
    return await HandLandmarker.createFromOptions(fileset, options('GPU'));
  } catch {
    return await HandLandmarker.createFromOptions(fileset, options('CPU'));
  }
}
