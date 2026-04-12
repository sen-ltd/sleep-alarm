/**
 * sleep.js — Pure sleep cycle calculation logic.
 * No DOM, no side effects.
 */

export const CYCLE_DURATION = 90; // minutes
export const DEFAULT_FALL_ASLEEP = 15; // minutes

/**
 * @param {number} cycles
 * @returns {'optimal'|'good'|'fair'|'short'}
 */
export function qualityLabel(cycles) {
  if (cycles >= 5) return 'optimal';
  if (cycles === 4) return 'good';
  if (cycles === 3) return 'fair';
  return 'short';
}

/**
 * @param {number} cycles
 * @returns {number} decimal hours of actual sleep
 */
export function cycleSleepHours(cycles) {
  return (cycles * CYCLE_DURATION) / 60;
}

/**
 * Format a Date to "HH:MM" string.
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Parse "HH:MM" string to { hours, minutes } or null.
 * @param {string} str
 * @returns {{ hours: number, minutes: number }|null}
 */
export function parseTime(str) {
  if (typeof str !== 'string') return null;
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Given a desired wake-up time, calculate bedtimes (going backwards).
 * Returns options for 6, 5, 4, 3 cycles.
 *
 * @param {Date} wakeUpTime
 * @param {number} fallAsleepMin — minutes to fall asleep (default 15)
 * @returns {Array<{ bedtime: Date, cycles: number, sleepHours: number, quality: string }>}
 */
export function calculateBedtimes(wakeUpTime, fallAsleepMin = DEFAULT_FALL_ASLEEP) {
  const cycleCounts = [6, 5, 4, 3];

  return cycleCounts.map((cycles) => {
    const totalMinutes = cycles * CYCLE_DURATION + fallAsleepMin;
    const bedtime = new Date(wakeUpTime.getTime() - totalMinutes * 60 * 1000);
    return {
      bedtime,
      cycles,
      sleepHours: cycleSleepHours(cycles),
      quality: qualityLabel(cycles),
    };
  });
}

/**
 * Given a bedtime, calculate wake-up times (going forwards).
 * Returns options for 3, 4, 5, 6 cycles.
 *
 * @param {Date} bedtime
 * @param {number} fallAsleepMin — minutes to fall asleep (default 15)
 * @returns {Array<{ wakeTime: Date, cycles: number, sleepHours: number, quality: string }>}
 */
export function calculateWakeUps(bedtime, fallAsleepMin = DEFAULT_FALL_ASLEEP) {
  const cycleCounts = [3, 4, 5, 6];

  return cycleCounts.map((cycles) => {
    const totalMinutes = cycles * CYCLE_DURATION + fallAsleepMin;
    const wakeTime = new Date(bedtime.getTime() + totalMinutes * 60 * 1000);
    return {
      wakeTime,
      cycles,
      sleepHours: cycleSleepHours(cycles),
      quality: qualityLabel(cycles),
    };
  });
}
