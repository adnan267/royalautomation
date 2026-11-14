import { handleUpload } from '@vercel/blob/client';
import { del } from '@vercel/blob';
import { HttpError } from '../utils/httpError.js';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
export const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_MB || 200);
export const videoUploadsEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * POST /api/uploads/video-token (admin only)
 * Issues a short-lived token so the admin's browser can upload a video file
 * DIRECTLY to Vercel Blob storage (bypassing the 4.5 MB function request limit).
 */
export async function videoUploadToken(req, res) {
  if (!videoUploadsEnabled()) {
    throw new HttpError(501, 'Video uploads are not set up yet. In Vercel, open Storage → Create → Blob and connect it to this project, then redeploy. YouTube links work without it.');
  }
  const result = await handleUpload({
    body: req.body,
    request: req,
    onBeforeGenerateToken: async (pathname) => {
      if (!/^gallery\//.test(pathname)) throw new HttpError(400, 'Invalid upload path');
      return {
        allowedContentTypes: VIDEO_TYPES,
        maximumSizeInBytes: MAX_VIDEO_MB * 1024 * 1024,
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      };
    },
  });
  res.json(result);
}

/** Deletes an uploaded video from Vercel Blob when its gallery item is removed. */
export async function deleteBlobIfOwned(url) {
  if (!url || !videoUploadsEnabled()) return;
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)) return;
  await del(url);
}
