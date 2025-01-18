export function escapeSpecialChars(input: string): string {
    const specialCharsRegex = /[.*+?^${}_%;<>()'"#+|[\]\\]/g;
    return input.replace(specialCharsRegex, '\\$&');
}
