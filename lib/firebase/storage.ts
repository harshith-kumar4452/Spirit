import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadComplaintImage(
  file: File,
  complaintId: string
): Promise<{ url: string; path: string }> {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `complaints/${complaintId}/${fileName}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return { url, path };
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
}

export async function deleteComplaintImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
}
