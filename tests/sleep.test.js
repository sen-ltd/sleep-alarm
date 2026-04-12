/**
 * sleep.test.js — Tests for sleep.js pure logic.
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CYCLE_DURATION,
  DEFAULT_FALL_ASLEEP,
  qualityLabel,
  cycleSleepHours,
  formatTime,
  parseTime,
  calculateBedtimes,
  calculateWakeUps,
} from '../src/sleep.js';

// ── Constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('CYCLE_DURATION is 90', () => {
    assert.equal(CYCLE_DURATION, 90);
  });

  it('DEFAULT_FALL_ASLEEP is 15', () => {
    assert.equal(DEFAULT_FALL_ASLEEP, 15);
  });
});

// ── qualityLabel ──────────────────────────────────────────────────────────────

describe('qualityLabel', () => {
  it('6 cycles → optimal', () => {
    assert.equal(qualityLabel(6), 'optimal');
  });

  it('5 cycles → optimal', () => {
    assert.equal(qualityLabel(5), 'optimal');
  });

  it('4 cycles → good', () => {
    assert.equal(qualityLabel(4), 'good');
  });

  it('3 cycles → fair', () => {
    assert.equal(qualityLabel(3), 'fair');
  });

  it('2 cycles → short', () => {
    assert.equal(qualityLabel(2), 'short');
  });

  it('1 cycle → short', () => {
    assert.equal(qualityLabel(1), 'short');
  });
});

// ── cycleSleepHours ───────────────────────────────────────────────────────────

describe('cycleSleepHours', () => {
  it('4 cycles = 6.0h', () => {
    assert.equal(cycleSleepHours(4), 6.0);
  });

  it('5 cycles = 7.5h', () => {
    assert.equal(cycleSleepHours(5), 7.5);
  });

  it('6 cycles = 9.0h', () => {
    assert.equal(cycleSleepHours(6), 9.0);
  });

  it('3 cycles = 4.5h', () => {
    assert.equal(cycleSleepHours(3), 4.5);
  });
});

// ── formatTime ────────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats midnight as 00:00', () => {
    const d = new Date(2026, 0, 1, 0, 0, 0);
    assert.equal(formatTime(d), '00:00');
  });

  it('formats noon as 12:00', () => {
    const d = new Date(2026, 0, 1, 12, 0, 0);
    assert.equal(formatTime(d), '12:00');
  });

  it('pads single digit hours and minutes', () => {
    const d = new Date(2026, 0, 1, 7, 5, 0);
    assert.equal(formatTime(d), '07:05');
  });

  it('formats 23:59 correctly', () => {
    const d = new Date(2026, 0, 1, 23, 59, 0);
    assert.equal(formatTime(d), '23:59');
  });
});

// ── parseTime ─────────────────────────────────────────────────────────────────

describe('parseTime', () => {
  it('parses 07:30', () => {
    assert.deepEqual(parseTime('07:30'), { hours: 7, minutes: 30 });
  });

  it('parses 00:00', () => {
    assert.deepEqual(parseTime('00:00'), { hours: 0, minutes: 0 });
  });

  it('parses 23:59', () => {
    assert.deepEqual(parseTime('23:59'), { hours: 23, minutes: 59 });
  });

  it('returns null for invalid format', () => {
    assert.equal(parseTime('abc'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseTime(''), null);
  });

  it('returns null for out-of-range hours', () => {
    assert.equal(parseTime('25:00'), null);
  });

  it('returns null for out-of-range minutes', () => {
    assert.equal(parseTime('07:60'), null);
  });

  it('returns null for non-string input', () => {
    assert.equal(parseTime(null), null);
    assert.equal(parseTime(undefined), null);
    assert.equal(parseTime(730), null);
  });
});

// ── calculateBedtimes ─────────────────────────────────────────────────────────

describe('calculateBedtimes', () => {
  // Wake at 07:00, fall asleep in 15 min
  const wakeAt7 = new Date(2026, 0, 1, 7, 0, 0);

  it('returns 4 options', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    assert.equal(results.length, 4);
  });

  it('options have cycle counts 6,5,4,3', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    const counts = results.map((r) => r.cycles);
    assert.deepEqual(counts, [6, 5, 4, 3]);
  });

  it('6-cycle bedtime = 07:00 - (6*90+15)min = 07:00 - 555min = 22:45 previous day', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    const six = results.find((r) => r.cycles === 6);
    // 6*90 = 540 + 15 = 555 min before 07:00
    // 07:00 - 9h15min = 21:45 previous day
    assert.equal(formatTime(six.bedtime), '21:45');
  });

  it('5-cycle bedtime = 07:00 - (5*90+15)min = 07:00 - 465min = 23:15', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    const five = results.find((r) => r.cycles === 5);
    // 5*90=450+15=465 min = 7h45min
    // 07:00 - 7h45min = 23:15
    assert.equal(formatTime(five.bedtime), '23:15');
  });

  it('4-cycle: sleepHours = 6.0', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    const four = results.find((r) => r.cycles === 4);
    assert.equal(four.sleepHours, 6.0);
  });

  it('accounts for fall-asleep time = 0', () => {
    const results = calculateBedtimes(wakeAt7, 0);
    const four = results.find((r) => r.cycles === 4);
    // 4*90 = 360 min = 6h before 07:00 → 01:00
    assert.equal(formatTime(four.bedtime), '01:00');
  });

  it('midnight crossing: wake at 06:00, 5 cycles + 15min → bedtime should be 22:15', () => {
    const wakeAt6 = new Date(2026, 0, 2, 6, 0, 0);
    const results = calculateBedtimes(wakeAt6, 15);
    const five = results.find((r) => r.cycles === 5);
    // 5*90+15 = 465 min = 7h45min before 06:00 → 22:15 previous day
    assert.equal(formatTime(five.bedtime), '22:15');
  });

  it('quality labels are assigned', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    assert.equal(results.find((r) => r.cycles === 6).quality, 'optimal');
    assert.equal(results.find((r) => r.cycles === 5).quality, 'optimal');
    assert.equal(results.find((r) => r.cycles === 4).quality, 'good');
    assert.equal(results.find((r) => r.cycles === 3).quality, 'fair');
  });

  it('each result has bedtime as a Date', () => {
    const results = calculateBedtimes(wakeAt7, 15);
    results.forEach((r) => {
      assert.ok(r.bedtime instanceof Date);
    });
  });
});

// ── calculateWakeUps ──────────────────────────────────────────────────────────

describe('calculateWakeUps', () => {
  // Bed at 23:00, fall asleep in 15 min
  const bedAt23 = new Date(2026, 0, 1, 23, 0, 0);

  it('returns 4 options', () => {
    const results = calculateWakeUps(bedAt23, 15);
    assert.equal(results.length, 4);
  });

  it('options have cycle counts 3,4,5,6', () => {
    const results = calculateWakeUps(bedAt23, 15);
    const counts = results.map((r) => r.cycles);
    assert.deepEqual(counts, [3, 4, 5, 6]);
  });

  it('3-cycle wakeTime = 23:00 + (3*90+15)min = 23:00 + 285min = 03:45', () => {
    const results = calculateWakeUps(bedAt23, 15);
    const three = results.find((r) => r.cycles === 3);
    assert.equal(formatTime(three.wakeTime), '03:45');
  });

  it('5-cycle wakeTime = 23:00 + 465min = 06:45', () => {
    const results = calculateWakeUps(bedAt23, 15);
    const five = results.find((r) => r.cycles === 5);
    // 5*90+15=465 min = 7h45min → 06:45 next day
    assert.equal(formatTime(five.wakeTime), '06:45');
  });

  it('6-cycle: sleepHours = 9.0', () => {
    const results = calculateWakeUps(bedAt23, 15);
    const six = results.find((r) => r.cycles === 6);
    assert.equal(six.sleepHours, 9.0);
  });

  it('midnight bedtime: bed at 00:00, 4 cycles → wakeTime = 06:15', () => {
    const midnight = new Date(2026, 0, 1, 0, 0, 0);
    const results = calculateWakeUps(midnight, 15);
    const four = results.find((r) => r.cycles === 4);
    // 4*90+15=375min = 6h15min → 06:15
    assert.equal(formatTime(four.wakeTime), '06:15');
  });

  it('fall-asleep time = 0: 5 cycles from 23:00 → 06:30', () => {
    const results = calculateWakeUps(bedAt23, 0);
    const five = results.find((r) => r.cycles === 5);
    // 5*90=450min = 7h30min → 06:30
    assert.equal(formatTime(five.wakeTime), '06:30');
  });

  it('quality labels are assigned', () => {
    const results = calculateWakeUps(bedAt23, 15);
    assert.equal(results.find((r) => r.cycles === 6).quality, 'optimal');
    assert.equal(results.find((r) => r.cycles === 5).quality, 'optimal');
    assert.equal(results.find((r) => r.cycles === 4).quality, 'good');
    assert.equal(results.find((r) => r.cycles === 3).quality, 'fair');
  });

  it('each result has wakeTime as a Date', () => {
    const results = calculateWakeUps(bedAt23, 15);
    results.forEach((r) => {
      assert.ok(r.wakeTime instanceof Date);
    });
  });
});
