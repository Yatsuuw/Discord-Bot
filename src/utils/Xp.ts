/**
 * 
 * @param level 
 * @param xp 
 * @returns
 */

export function Xp(level: number, xp: number) {

    const requiredXp = Math.floor(Math.pow(level + 1, 1.5) * 50); // Change the value to "1.5" or "50" to reduce or increase the experience required to pass levels.
    xp += 10;

    if (xp >= requiredXp) {
        level += 1;
        xp -= requiredXp;
    }

    return { level: Math.floor(level), xp: Math.floor(xp) };

}

/**
 * 
 * @param min 
 * @param max 
 * @returns 
 */
export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
