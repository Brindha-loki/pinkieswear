import insforge from './insforge';

/**
 * Convert data URL to Blob
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mimeType });
}

/**
 * Convert URL image to Blob (for gallery images)
 */
export async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }
  return response.blob();
}

/**
 * Upload image to InsForge Storage using order number as filename
 * @param dataUrl - Base64 data URL of the image
 * @param orderNumber - Order number (e.g., TPS-000001)
 * @param bucketName - Storage bucket name ('inspiration-images' or 'nail-size-images')
 * @param imageIndex - Optional index for multiple images (e.g., 0, 1, 2, 3)
 * @returns URL of the uploaded image
 */
export async function uploadImageToStorage(
  dataUrl: string,
  orderNumber: string,
  bucketName: 'inspiration-images' | 'nail-size-images',
  imageIndex?: number
): Promise<string> {
  try {
    // Convert data URL to Blob
    const blob = dataUrlToBlob(dataUrl);

    // Generate filename: orderNumber.jpg or orderNumber-1.jpg, orderNumber-2.jpg, etc.
    const fileName = imageIndex !== undefined 
      ? `${orderNumber}-${imageIndex}.jpg`
      : `${orderNumber}.jpg`;

    // Upload to InsForge Storage
    const { data, error } = await insforge.storage
      .from(bucketName)
      .upload(fileName, blob);

    if (error) {
      console.error('[StorageHelper] Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = insforge.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log('[StorageHelper] Image uploaded successfully:', {
      bucket: bucketName,
      file: fileName,
      url: publicUrlData.publicUrl,
    });
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('[StorageHelper] Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload gallery image as inspiration image for an order
 * @param galleryImageUrl - URL of the gallery image
 * @param orderNumber - Order number (e.g., TPS-000001)
 * @returns URL of the uploaded image
 */
export async function uploadGalleryImageAsInspiration(
  galleryImageUrl: string,
  orderNumber: string
): Promise<string> {
  try {
    const blob = await urlToBlob(galleryImageUrl);
    const fileName = `${orderNumber}.jpg`;

    // Upload to inspiration-images bucket
    const { data, error } = await insforge.storage
      .from('inspiration-images')
      .upload(fileName, blob);

    if (error) {
      console.error('[StorageHelper] Gallery image upload error:', error);
      throw new Error(`Failed to upload gallery image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = insforge.storage
      .from('inspiration-images')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for gallery image');
    }

    console.log('[StorageHelper] Gallery image uploaded successfully:', {
      file: fileName,
      url: publicUrlData.publicUrl,
    });
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('[StorageHelper] Error uploading gallery image:', error);
    throw error;
  }
}

/**
 * Generate filename for order images (legacy - kept for reference)
 * @param orderId - Order ID
 * @param imageType - Type of image ('inspiration' or 'nail_photo')
 * @returns Unique filename
 */
export function generateImageFileName(orderId: string, imageType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `orders/${orderId}/${imageType}-${timestamp}-${random}.jpg`;
}
