export async function uploadComplaintImage(
  file: File,
  complaintId: string
): Promise<{ url: string; path: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('complaintId', complaintId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return { url: data.url, path: data.path };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function deleteComplaintImage(publicId: string): Promise<void> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
}
