const LEVEL_THRESHOLDS = [0, 50, 150, 350, 600, 1000, 1500];
const LEVEL_TITLES = [
  'Newcomer',
  'Citizen',
  'Active Citizen',
  'Community Voice',
  'Civic Champion',
  'Neighbourhood Guardian',
  'City Hero'
];

export const XP_REWARDS = {
  SUBMIT_COMPLAINT: 10,
  COMPLAINT_VERIFIED: 15,
  COMPLAINT_RESOLVED: 30,
  RECEIVE_UPVOTE: 2,
  GIVE_UPVOTE: 1,
  COMPLAINT_REJECTED: -5,
};

export function calculateLevel(xp: number): { level: number; title: string } {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return { level, title: LEVEL_TITLES[level - 1] };
}

export function xpToNextLevel(xp: number, currentLevel: number): {
  current: number;
  required: number;
  percentage: number;
} {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return { current: xp, required: xp, percentage: 100 };
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  const progress = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;

  return {
    current: progress,
    required,
    percentage: Math.round((progress / required) * 100),
  };
}

export function getNextLevelTitle(currentLevel: number): string {
  if (currentLevel >= LEVEL_TITLES.length) {
    return LEVEL_TITLES[LEVEL_TITLES.length - 1];
  }
  return LEVEL_TITLES[currentLevel];
}
