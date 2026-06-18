export const ANIMAL_TYPES = [
  { key: "dog",    label: "Dog",     emoji: "🐶" },
  { key: "cat",    label: "Cat",     emoji: "🐱" },
  { key: "rabbit", label: "Rabbit",  emoji: "🐰" },
  { key: "bird",   label: "Bird",    emoji: "🐦" },
  { key: "hamster",label: "Hamster", emoji: "🐹" },
  { key: "fish",   label: "Fish",    emoji: "🐟" },
  { key: "turtle", label: "Turtle",  emoji: "🐢" },
  { key: "lizard", label: "Reptile", emoji: "🦎" },
  { key: "horse",  label: "Horse",   emoji: "🐴" },
  { key: "other",  label: "Other",   emoji: "🐾" },
] as const;

export function getAnimal(key: string | null | undefined) {
  return ANIMAL_TYPES.find((a) => a.key === key);
}
