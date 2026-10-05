import { filesApi } from './endpoints';

type PhotoPurpose = 'STUDENT_PHOTO' | 'COACH_PHOTO' | 'TEAM_PHOTO';

/** ImageUpload hands back a data: URL for a newly picked file; turn it into a File for upload. */
export function dataUrlToFile(dataUrl: string, baseName = 'photo', fileName?: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? 'image/jpeg';
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  return new File([bytes], fileName ?? `${baseName}.${ext}`, { type: mime });
}

/**
 * The `photoFileId` part of a create/update body for an ImageUpload value:
 * - a new data: URL is uploaded and its file id returned;
 * - an empty value clears a photo that existed before (`null`);
 * - an unchanged existing URL leaves the photo alone (field omitted).
 */
export async function photoField(
  value: string,
  previous: string | undefined,
  purpose: PhotoPurpose
): Promise<{ photoFileId?: string | null }> {
  if (value.startsWith('data:')) {
    const uploaded = await filesApi.upload(dataUrlToFile(value), purpose);
    return { photoFileId: uploaded.id };
  }
  if (!value && previous) return { photoFileId: null };
  return {};
}

/** Placeholder portrait (initials on a tinted square) for people without a photo. */
export function avatarFor(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('');
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
    `<rect width="200" height="200" fill="hsl(${hue},45%,88%)"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="80" font-weight="700" fill="hsl(${hue},45%,32%)">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
