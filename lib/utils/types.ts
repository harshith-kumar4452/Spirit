import { Timestamp } from 'firebase/firestore';

export type ComplaintCategory =
  | 'road_damage'
  | 'streetlight'
  | 'sanitation'
  | 'public_property'
  | 'water_supply'
  | 'safety_hazard'
  | 'public_notice'
  | 'greenery'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type UserRole = 'citizen' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  xp: number;
  level: number;
  levelTitle: string;
  totalComplaints: number;
  resolvedComplaints: number;
  upvotesReceived: number;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string;

  // Content
  title: string;
  description: string;
  category: ComplaintCategory;
  imageURL: string;
  imagePath: string;

  // Location
  location: {
    lat: number;
    lng: number;
    address: string;
    area: string;
  };
  geohash: string;

  // Status & Admin
  status: ComplaintStatus;
  priority: Priority;
  adminNotes: string;
  assignedTo: string | null;

  // Engagement
  upvotes: number;
  upvotedBy: string[];

  // Validation
  imageValidation: {
    passed: boolean;
    checks: {
      fileType: boolean;
      resolution: boolean;
      hasExif: boolean;
      fileSize: boolean;
    };
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
}

export interface ActivityLog {
  id: string;
  action: 'status_change' | 'priority_change' | 'note_added' | 'upvoted';
  fromValue: string | null;
  toValue: string;
  performedBy: string;
  performedByName: string;
  timestamp: Timestamp;
  note: string | null;
}
