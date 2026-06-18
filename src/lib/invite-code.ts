const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I,L,O,0,1

export function generateInviteCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
