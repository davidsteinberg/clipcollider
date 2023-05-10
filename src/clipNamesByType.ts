const clipNamesByType = {
  englishPhrase: "English phrase",
  spanishPhrase: "Spanish phrase",
  spanishPhraseSlowedDown: "Spanish phrase slowed down",
  example1: "Example 1",
  example2: "Example 2",
  example3: "Example 3",
} as const;

type ClipType = keyof typeof clipNamesByType;

export type { ClipType };
export default clipNamesByType;
