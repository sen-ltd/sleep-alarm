/**
 * i18n.js — Japanese / English translations.
 */

export const translations = {
  ja: {
    appTitle: '睡眠サイクル計算機',
    appSubtitle: '90分サイクルで最適な睡眠時間を計算',
    tabWakeUp: '起床時刻から逆算',
    tabBedTime: '就寝時刻から計算',
    wakeUpLabel: '起床したい時刻',
    bedTimeLabel: '就寝する時刻',
    bedNowBtn: '今すぐ寝る',
    fallAsleepLabel: '入眠にかかる時間',
    fallAsleepUnit: '分',
    calculateBtn: '計算する',
    resultsTitle: '推奨{mode}時刻',
    resultsWakeMode: '就寝',
    resultsBedMode: '起床',
    cyclesUnit: 'サイクル',
    sleepHoursUnit: '時間',
    qualityOptimal: '最適',
    qualityGood: '良好',
    qualityFair: '普通',
    qualityShort: '短め',
    qualityDesc: {
      optimal: '多くの人に理想的な睡眠時間です',
      good: '機能的な睡眠時間です',
      fair: '最低限の睡眠時間です',
      short: '睡眠不足になる可能性があります',
    },
    cycleExplain: {
      6: '9時間 — 回復・成長に最適',
      5: '7.5時間 — ほとんどの人に推奨',
      4: '6時間 — 機能的に活動可能',
      3: '4.5時間 — 緊急時のみ',
    },
    bedtimePrefix: '就寝',
    wakePrefix: '起床',
    phaseLight: '浅い眠り',
    phaseDeep: '深い眠り',
    phaseREM: 'REM',
    legend: '凡例',
    footer: '90分の睡眠サイクルに基づいた計算です。入眠時間を差し引いて最適な就寝・起床時刻を提案します。',
    langToggle: 'EN',
  },
  en: {
    appTitle: 'Sleep Cycle Calculator',
    appSubtitle: 'Calculate optimal sleep times based on 90-minute cycles',
    tabWakeUp: 'Wake Up At',
    tabBedTime: 'Going to Bed At',
    wakeUpLabel: 'I want to wake up at',
    bedTimeLabel: 'I\'m going to bed at',
    bedNowBtn: 'Sleep Now',
    fallAsleepLabel: 'Time to fall asleep',
    fallAsleepUnit: 'min',
    calculateBtn: 'Calculate',
    resultsTitle: 'Suggested {mode} times',
    resultsWakeMode: 'bedtime',
    resultsBedMode: 'wake-up',
    cyclesUnit: 'cycles',
    sleepHoursUnit: 'h',
    qualityOptimal: 'Optimal',
    qualityGood: 'Good',
    qualityFair: 'Fair',
    qualityShort: 'Short',
    qualityDesc: {
      optimal: 'Ideal sleep duration for most people',
      good: 'Functional amount of sleep',
      fair: 'Minimum recommended sleep',
      short: 'May cause sleep deprivation',
    },
    cycleExplain: {
      6: '9h — Best for recovery',
      5: '7.5h — Recommended for most',
      4: '6h — Functional',
      3: '4.5h — Emergency only',
    },
    bedtimePrefix: 'Bed',
    wakePrefix: 'Wake',
    phaseLight: 'Light',
    phaseDeep: 'Deep',
    phaseREM: 'REM',
    legend: 'Legend',
    footer: 'Based on 90-minute sleep cycles. Fall-asleep time is accounted for in all calculations.',
    langToggle: 'JA',
  },
};

let currentLang = 'ja';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) currentLang = lang;
}

export function toggleLang() {
  currentLang = currentLang === 'ja' ? 'en' : 'ja';
  return currentLang;
}

export function t(key) {
  const parts = key.split('.');
  let obj = translations[currentLang];
  for (const part of parts) {
    if (obj == null) return key;
    obj = obj[part];
  }
  return obj != null ? obj : key;
}
