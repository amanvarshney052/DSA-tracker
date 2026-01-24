import { SiLeetcode, SiCodeforces, SiGeeksforgeeks, SiCodechef, SiHackerrank } from 'react-icons/si';
import { BsLink45Deg } from 'react-icons/bs';

// Platform icon mapping
export const PLATFORM_ICONS = {
    leetcode: SiLeetcode,
    codeforces: SiCodeforces,
    gfg: SiGeeksforgeeks,
    codechef: SiCodechef,
    hackerrank: SiHackerrank,
    custom: BsLink45Deg,
};

// Platform colors
export const PLATFORM_COLORS = {
    leetcode: '#FFA116',
    codeforces: '#1F8ACB',
    gfg: '#2F8D46',
    codechef: '#5B4638',
    hackerrank: '#00EA64',
    custom: '#6B7280',
};

// Difficulty colors
export const DIFFICULTY_COLORS = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
};

// DSA Topics
export const DSA_TOPICS = [
    'Array',
    'String',
    'Linked List',
    'Stack',
    'Queue',
    'Tree',
    'Graph',
    'Dynamic Programming',
    'Greedy',
    'Backtracking',
    'Sorting',
    'Searching',
    'Hashing',
    'Heap',
    'Trie',
    'Bit Manipulation',
    'Math',
    'Recursion',
    'Divide and Conquer',
    'Two Pointers',
    'Sliding Window',
];

// Revision intervals in days
export const REVISION_INTERVALS = [1, 7, 30];

// XP per difficulty
export const XP_PER_DIFFICULTY = {
    easy: 10,
    medium: 20,
    hard: 30,
};
