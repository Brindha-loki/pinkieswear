const fs = require('fs');
const path = require('path');
let fetch = globalThis.fetch;
if (!fetch) {
  try {
    const nf = require('node-fetch');
    fetch = nf.default || nf;
  } catch (e) {
    // leave fetch undefined — will error later
  }
}
const dotenv = require('dotenv');
// Load .env.local from project root so secrets provided there are available
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'gallery';
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment. Aborting.');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { fetch }
  });

  // Ensure the bucket exists (create if missing)
  try {
    const { data: created, error: createErr } = await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true });
    if (createErr && createErr.status !== 409) {
      console.warn('Bucket creation warning/error:', createErr.message || createErr);
    } else if (created) {
      console.log('Created bucket', SUPABASE_BUCKET);
    }
  } catch (e) {
    console.warn('Bucket creation skipped or failed:', e.message || e);
  }

  // Prefer an exported JSON file produced by scripts/import-gallery.js
  const dataPath = path.join(__dirname, 'gallery-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Missing gallery-data.json. Run scripts/import-gallery.js first or place a gallery-data.json in scripts/.');
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const mapping = [];

  for (const item of items) {
    try {
      // Determine file name and remote URL
      // Support various column names coming from the Excel: try common keys, then fall back
      let remoteUrl = item.image || item.image_url || item.Image || item.imageUrl || item['image link'] || item['Image Link'] || item['image_link'];
      if (!remoteUrl) {
        const imageKey = Object.keys(item).find(k => /image|link/i.test(k));
        if (imageKey) remoteUrl = item[imageKey];
      }
      if (!remoteUrl) {
        console.warn('Skipping item without image URL:', item);
        continue;
      }

      // If the URL is a Google Drive share link, convert to a direct download URL
      let downloadUrl = remoteUrl;
      const driveMatch = remoteUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
      const driveOpenMatch = remoteUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
      if (driveMatch) downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      else if (driveOpenMatch) downloadUrl = `https://drive.google.com/uc?export=download&id=${driveOpenMatch[1]}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        console.warn('Failed to fetch', remoteUrl, 'status', res.status);
        continue;
      }
      const buffer = await res.arrayBuffer();
      const fileExtMatch = (remoteUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/) || [])[1] || 'jpg';
      const fileName = `${item.id || item.ID || Date.now()}.${fileExtMatch}`;
      const uploadPath = `gallery/${fileName}`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(uploadPath, Buffer.from(buffer), { upsert: true });

      if (error) {
        console.warn('Upload failed for', remoteUrl, error.message || error);
        continue;
      }

      const publicInfo = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(uploadPath);
      const publicURL = (publicInfo && publicInfo.data && (publicInfo.data.publicUrl || publicInfo.data.publicURL)) || null;

      mapping.push({ id: item.id || item.ID || null, original: remoteUrl, uploaded: publicURL });
      console.log('Uploaded', remoteUrl, '->', publicURL);
    } catch (e) {
      console.warn('Error processing item', item, e.message || e);
    }
  }

  const outPath = path.join(__dirname, 'gallery-upload-mapping.json');
  fs.writeFileSync(outPath, JSON.stringify(mapping, null, 2));
  console.log('Wrote mapping to', outPath);

  // Optionally update InsForge DB if credentials provided
  if (process.env.INSFORGE_SERVICE_KEY && process.env.NEXT_PUBLIC_INSFORGE_URL) {
    try {
      const { createClient: createIns } = require('@insforge/sdk');
      const ins = createIns({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
        anonKey: process.env.INSFORGE_SERVICE_KEY
      });

      for (const m of mapping) {
        if (!m.id) continue;
        const upd = await ins.database.from('gallery_products').update({ image_url: m.uploaded }).eq('id', m.id);
        console.log('Updated DB for id', m.id, 'result:', upd.data ? 'ok' : upd.error || 'unknown');
      }
    } catch (e) {
      console.warn('InsForge update skipped or failed:', e.message || e);
    }
  } else {
    console.log('InsForge update skipped (no INSFORGE_SERVICE_KEY/NEXT_PUBLIC_INSFORGE_URL supplied).');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
