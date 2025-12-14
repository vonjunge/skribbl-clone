// Word bank organized into 3 distinct categories
// Words are loaded from environment variables for easy customization

// Parse word lists from environment variables
// Format: comma-separated words in env vars
const parseWordList = (envVar, fallback) => {
  const envValue = process.env[envVar];
  if (envValue && envValue.trim()) {
    return envValue.split(',').map(word => word.trim()).filter(word => word.length > 0);
  }
  return fallback;
};

// CATEGORY 1: EASY - Simple, everyday objects and common things
const DEFAULT_POWERBI_WORDS = [
  "Dashboard", "Report", "Data Model", "DAX", "Table", "Matrix", "Slicer", "Visual", "KPI", "Measure", "Semantic Model", "Power Query", "Dataflow", "Fabric", "Lakehouse", "Star Schema", "Column", "Row-Level Security", "Refresh", "Filter", "Bookmark", "Tooltip", "Card Visual", "Drillthrough", "DirectQuery", "Pagination", "Line Chart", "Scatter Plot", "Broken Refresh", "Spinning Loading Wheel"
];

// CATEGORY 2: MEDIUM - Actions, activities, and more complex concepts
const DEFAULT_CHRISTMAS_WORDS = [
  "Santa", "Reindeer", "Snowman", "Elf", "Christmas Tree", "Ornament", "Candy Cane", "Stocking", "Fireplace", "Gift", "Sleigh", "Snowflake", "Chimney", "Hot Chocolate", "Mistletoe", "Gingerbread", "Carols", "Star", "North Pole", "Christmas Lights", "Wreath", "Bell", "Nutcracker", "Santa Hat", "Grinch", "Ugly Sweater", "Cookies", "Snowball", "Christmas Miracle", "Overcooked Turkey"
];

// CATEGORY 3: HARD - Complex objects, abstract concepts, and compound items
const DEFAULT_DIEHARD_WORDS = [
  "Tower", "Gun", "Walkie-Talkie", "Police", "Glass", "Explosion", "Roof", "Elevator", "Truck", "Car", "Window", "Door", "Money", "Hostage", "Badge", "Fire", "Tape", "Radio", "Plane", "Shirt", "Building", "Key", "Phone", "Ladder", "Box", "Tie", "Suit", "Floor", "Bag", "Air vent"
];

// Load word lists from environment or use defaults
export const POWERBI_WORDS = parseWordList('POWERBI_WORDS', DEFAULT_POWERBI_WORDS);
export const CHRISTMAS_WORDS = parseWordList('CHRISTMAS_WORDS', DEFAULT_CHRISTMAS_WORDS);
export const DIEHARD_WORDS = parseWordList('DIEHARD_WORDS', DEFAULT_DIEHARD_WORDS);

/**
 * Get one random word from each category (Easy, Medium, Hard)
 * Returns an array of 3 words, one from each difficulty level
 */
export function getRandomWords(count = 3) {
  const categories = [POWERBI_WORDS, CHRISTMAS_WORDS, DIEHARD_WORDS];
  const selectedWords = [];
  
  for (let i = 0; i < Math.min(count, 3); i++) {
    const category = categories[i];
    const randomIndex = Math.floor(Math.random() * category.length);
    selectedWords.push(category[randomIndex]);
  }
  
  return selectedWords;
}

/**
 * Get a random word from any category
 */
export function getRandomWord() {
  const allWords = [...POWERBI_WORDS, ...CHRISTMAS_WORDS, ...DIEHARD_WORDS];
  return allWords[Math.floor(Math.random() * allWords.length)];
}
