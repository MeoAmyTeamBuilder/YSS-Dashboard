/**
 * Converts a Google Drive sharing link to a direct download link.
 * @param url The Google Drive sharing URL
 * @returns The direct download URL or the original URL if not a Drive link
 */
export const getDirectDriveUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Check if it's a Google Drive link
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern 1: /file/d/FILE_ID
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    // Pattern 2: ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    // Pattern 3: /d/FILE_ID
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

    if (fileDMatch) fileId = fileDMatch[1];
    else if (idMatch) fileId = idMatch[1];
    else if (dMatch) fileId = dMatch[1];
    
    if (fileId) {
      // Thumbnail API is often the most reliable for direct image embedding
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }
  
  return url;
};

/**
 * Formats a number into a compact string (e.g., 1.2M, 500K)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Parses a string or number into an integer, handling K, M, B suffixes.
 */
export const parseNumber = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return Math.round(val);
  
  let str = String(val).replace(/,/g, '').trim().toUpperCase();
  let multiplier = 1;
  
  if (str.endsWith('B')) {
    multiplier = 1000000000;
    str = str.slice(0, -1);
  } else if (str.endsWith('M')) {
    multiplier = 1000000;
    str = str.slice(0, -1);
  } else if (str.endsWith('K')) {
    multiplier = 1000;
    str = str.slice(0, -1);
  }
  
  const num = Number(str) * multiplier;
  return isNaN(num) ? 0 : Math.round(num);
};
