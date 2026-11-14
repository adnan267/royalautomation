/** Recognises YouTube / Vimeo links and uploaded video files. */
export function parseVideo(url = '') {
  const u = String(url).trim();
  if (!u) return null;
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) {
    return {
      provider: 'youtube',
      id: m[1],
      embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`,
      thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`,
    };
  }
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return { provider: 'vimeo', id: m[1], embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, thumb: '' };
  if (/^https?:\/\/.+\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(u) || /blob\.vercel-storage\.com/i.test(u)) return { provider: 'file', src: u, thumb: '' };
  return null;
}

export const videoThumb = (item) => item.image || parseVideo(item.videoUrl)?.thumb || '';
