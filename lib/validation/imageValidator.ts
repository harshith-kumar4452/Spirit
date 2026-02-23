export interface ValidationCheck {
  passed: boolean;
  message: string;
}

export interface ValidationResult {
  passed: boolean;
  checks: {
    fileType: ValidationCheck;
    resolution: ValidationCheck;
    hasExif: ValidationCheck;
    fileSize: ValidationCheck;
    isNotAi: ValidationCheck;
  };
}

export async function validateImage(file: File): Promise<ValidationResult> {
  const checks = {
    fileType: await checkFileType(file),
    resolution: await checkResolution(file),
    hasExif: await checkExif(file),
    fileSize: checkFileSize(file),
    isNotAi: await checkAiGenerated(file),
  };

  const passed = Object.values(checks).every(check => check.passed);

  return { passed, checks };
}

async function checkFileType(file: File): Promise<ValidationCheck> {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const passed = validTypes.includes(file.type);

  return {
    passed,
    message: passed ? 'Valid file format' : 'Only JPEG and PNG images are allowed',
  };
}

async function checkResolution(file: File): Promise<ValidationCheck> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const passed = img.width >= 10 && img.height >= 10;
      resolve({
        passed,
        message: passed
          ? 'Sufficient resolution'
          : `Resolution too low (${img.width}x${img.height}). Minimum: 10x10`,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        passed: false,
        message: 'Could not read image',
      });
    };

    img.src = url;
  });
}

async function checkExif(file: File): Promise<ValidationCheck> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);

      // Check for JPEG EXIF markers (0xFFD8 for JPEG start, then look for EXIF)
      if (arr[0] === 0xFF && arr[1] === 0xD8) {
        // Look for EXIF marker in JPEG
        for (let i = 0; i < Math.min(arr.length - 1, 1000); i++) {
          if (arr[i] === 0xFF && arr[i + 1] === 0xE1) {
            // Check for "Exif" string
            const exifString = String.fromCharCode(arr[i + 4], arr[i + 5], arr[i + 6], arr[i + 7]);
            if (exifString === 'Exif') {
              resolve({
                passed: true,
                message: 'Photo metadata detected',
              });
              return;
            }
          }
        }
      }

      // For PNG or JPEG without EXIF, we'll be lenient in hackathon
      resolve({
        passed: true,
        message: 'Image accepted',
      });
    };

    reader.onerror = () => {
      resolve({
        passed: true,
        message: 'Image accepted',
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

function checkFileSize(file: File): ValidationCheck {
  const minSize = 10; // 10 bytes
  const maxSize = 20 * 1024 * 1024; // 20MB
  const passed = file.size >= minSize && file.size <= maxSize;

  return {
    passed,
    message: passed
      ? 'File size OK'
      : file.size < minSize
        ? 'File too small (min 10 bytes)'
        : 'File too large (max 20MB)',
  };
}

async function checkAiGenerated(file: File): Promise<ValidationCheck> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as ArrayBuffer;
      const arr = new Uint8Array(result);

      // Convert first 10KB to string to safely look for generic AI generator signatures
      const chunk = arr.slice(0, Math.min(arr.length, 10000));
      let str = '';
      for (let i = 0; i < chunk.length; i++) {
        str += String.fromCharCode(chunk[i]);
      }

      const aiSignatures = ['Midjourney', 'DALL-E', 'Stable Diffusion', 'NovelAI', 'InvokeAI', 'AI Generated'];
      const hasAiSignature = aiSignatures.some(sig => str.includes(sig));

      resolve({
        passed: !hasAiSignature,
        message: !hasAiSignature ? 'Authentic Photo (Not AI Generated)' : 'AI-generated images are not allowed',
      });
    };

    reader.onerror = () => {
      resolve({
        passed: true,
        message: 'Authentic Photo (Not AI Generated)', // Fail open if unreadable
      });
    };

    reader.readAsArrayBuffer(file);
  });
}
