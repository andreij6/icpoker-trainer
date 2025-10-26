/**
 * Random name generator for AI players.
 * Names are neutral and don't reveal playing styles.
 */

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Avery', 'Quinn', 'Cameron', 'Dakota',
  'Skylar', 'Reese', 'Peyton', 'Charlie', 'Sage',
  'River', 'Phoenix', 'Rowan', 'Finley', 'Emerson',
  'Hayden', 'Kendall', 'Lennon', 'Marley', 'Parker',
  'Sawyer', 'Blake', 'Drew', 'Ellis', 'Harley',
  'Jamie', 'Jesse', 'Kai', 'Logan', 'Micah',
  'Nico', 'Oakley', 'Remy', 'Sam', 'Tatum'
];

const LAST_NAMES = [
  'Chen', 'Garcia', 'Patel', 'Kim', 'Martinez',
  'Johnson', 'Rodriguez', 'Lee', 'Brown', 'Davis',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
  'Young', 'King', 'Wright', 'Lopez', 'Hill',
  'Scott', 'Green', 'Adams', 'Baker', 'Nelson',
  'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips',
  'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins'
];

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a list of unique random names for AI players.
 * @param count The number of names to generate
 * @returns An array of unique full names
 */
export function generatePlayerNames(count: number): string[] {
  if (count > FIRST_NAMES.length) {
    throw new Error(`Cannot generate more than ${FIRST_NAMES.length} unique names`);
  }

  // Shuffle first names to ensure uniqueness
  const shuffledFirstNames = shuffleArray(FIRST_NAMES);
  
  // Shuffle last names for variety
  const shuffledLastNames = shuffleArray(LAST_NAMES);
  
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = shuffledFirstNames[i];
    const lastName = shuffledLastNames[i % shuffledLastNames.length];
    names.push(`${firstName} ${lastName}`);
  }
  
  return names;
}

/**
 * Generates a single random name.
 * @returns A random full name
 */
export function generateSingleName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

