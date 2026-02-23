import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Complaint, User, ActivityLog } from '../utils/types';
import { calculateLevel, XP_REWARDS } from '../gamification/xpEngine';
import ngeohash from 'ngeohash';

export async function createComplaint(
  complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'geohash'>
): Promise<string> {
  try {
    const geohash = ngeohash.encode(
      complaintData.location.lat,
      complaintData.location.lng,
      8
    );

    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaintData,
      geohash,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Award XP to user
    await updateDoc(doc(db, 'users', complaintData.userId), {
      xp: increment(XP_REWARDS.SUBMIT_COMPLAINT),
      totalComplaints: increment(1),
      lastActiveAt: serverTimestamp(),
    });

    // Update user level
    await updateUserLevel(complaintData.userId);

    return docRef.id;
  } catch (error) {
    console.error('Create complaint error:', error);
    throw error;
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  adminId: string,
  adminName: string,
  notes?: string,
  priority?: string
): Promise<void> {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintSnap = await getDoc(complaintRef);

    if (!complaintSnap.exists()) {
      throw new Error('Complaint not found');
    }

    const complaint = complaintSnap.data() as Complaint;
    const oldStatus = complaint.status;

    // Update complaint
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (notes) updates.adminNotes = notes;
    if (priority) updates.priority = priority;
    if (status === 'resolved') updates.resolvedAt = serverTimestamp();

    await updateDoc(complaintRef, updates);

    // Add activity log
    await addDoc(collection(db, 'complaints', complaintId, 'activity'), {
      action: 'status_change',
      fromValue: oldStatus,
      toValue: status,
      performedBy: adminId,
      performedByName: adminName,
      timestamp: serverTimestamp(),
      note: notes || null,
    });

    // Award XP based on status change — only to regular (non-admin) users
    let xpChange = 0;
    if (status === 'under_review' && oldStatus === 'submitted') {
      xpChange = XP_REWARDS.COMPLAINT_VERIFIED;
    } else if (status === 'resolved') {
      xpChange = XP_REWARDS.COMPLAINT_RESOLVED;
      await updateDoc(doc(db, 'users', complaint.userId), {
        resolvedComplaints: increment(1),
      });
    } else if (status === 'rejected') {
      xpChange = XP_REWARDS.COMPLAINT_REJECTED;
    }

    if (xpChange !== 0 && complaint.userId !== adminId) {
      // Check the complaint owner is not an admin before awarding XP
      const ownerSnap = await getDoc(doc(db, 'users', complaint.userId));
      const ownerData = ownerSnap.data();
      if (ownerData && ownerData.role !== 'admin') {
        await updateDoc(doc(db, 'users', complaint.userId), {
          xp: increment(xpChange),
          lastActiveAt: serverTimestamp(),
        });
        await updateUserLevel(complaint.userId);
      }
    }
  } catch (error) {
    console.error('Update complaint status error:', error);
    throw error;
  }
}

export async function toggleUpvote(
  complaintId: string,
  userId: string
): Promise<boolean> {
  try {
    return await runTransaction(db, async (transaction) => {
      const complaintRef = doc(db, 'complaints', complaintId);
      const complaintSnap = await transaction.get(complaintRef);

      if (!complaintSnap.exists()) {
        throw new Error('Complaint not found');
      }

      const complaint = complaintSnap.data() as Complaint;
      const hasUpvoted = complaint.upvotedBy.includes(userId);

      if (hasUpvoted) {
        // Remove upvote
        transaction.update(complaintRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(userId),
          updatedAt: serverTimestamp(),
        });

        // Remove XP from both users
        transaction.update(doc(db, 'users', userId), {
          xp: increment(-XP_REWARDS.GIVE_UPVOTE),
        });
        transaction.update(doc(db, 'users', complaint.userId), {
          xp: increment(-XP_REWARDS.RECEIVE_UPVOTE),
          upvotesReceived: increment(-1),
        });

        return false;
      } else {
        // Add upvote
        transaction.update(complaintRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(userId),
          updatedAt: serverTimestamp(),
        });

        // Award XP to both users
        transaction.update(doc(db, 'users', userId), {
          xp: increment(XP_REWARDS.GIVE_UPVOTE),
          lastActiveAt: serverTimestamp(),
        });
        transaction.update(doc(db, 'users', complaint.userId), {
          xp: increment(XP_REWARDS.RECEIVE_UPVOTE),
          upvotesReceived: increment(1),
        });

        // Update levels
        await updateUserLevel(userId);
        await updateUserLevel(complaint.userId);

        return true;
      }
    });
  } catch (error) {
    console.error('Toggle upvote error:', error);
    throw error;
  }
}

async function updateUserLevel(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as User;
    const { level, title } = calculateLevel(userData.xp);

    if (level !== userData.level) {
      await updateDoc(userRef, {
        level,
        levelTitle: title,
      });
    }
  }
}

export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
}
