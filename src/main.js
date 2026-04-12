/**
 * main.js — DOM, events, rendering.
 */

import {
  calculateBedtimes,
  calculateWakeUps,
  formatTime,
  DEFAULT_FALL_ASLEEP,
} from './sleep.js';

import { t, toggleLang, getLang } from './i18n.js';

// ─── State ────────────────────────────────────────────────────────────────────
let mode = 'wakeup'; // 'wakeup' | 'bedtime'

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const tabWakeUp = document.getElementById('tab-wakeup');
const tabBedTime = document.getElementById('tab-bedtime');
const panelWakeUp = document.getElementById('panel-wakeup');
const panelBedTime = document.getElementById('panel-bedtime');
const inputWakeTime = document.getElementById('input-wake-time');
const inputBedTime = document.getElementById('input-bed-time');
const btnBedNow = document.getElementById('btn-bed-now');
const fallAsleepSlider = document.getElementById('fall-asleep-slider');
const fallAsleepValue = document.getElementById('fall-asleep-value');
const btnCalculate = document.getElementById('btn-calculate');
const resultsSection = document.getElementById('results');
const resultsList = document.getElementById('results-list');
const resultsTitle = document.getElementById('results-title');
const langToggleBtn = document.getElementById('lang-toggle');

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Set default wake time to next rounded hour
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 7, 0, 0, 0);
  inputWakeTime.value = formatTime(nextHour);

  // Set default bed time to current time
  inputBedTime.value = formatTime(now);

  // Fall-asleep slider default
  fallAsleepSlider.value = DEFAULT_FALL_ASLEEP;
  updateSliderDisplay();

  // Render UI text
  renderText();

  // Listeners
  tabWakeUp.addEventListener('click', () => switchMode('wakeup'));
  tabBedTime.addEventListener('click', () => switchMode('bedtime'));
  btnBedNow.addEventListener('click', () => {
    inputBedTime.value = formatTime(new Date());
  });
  fallAsleepSlider.addEventListener('input', updateSliderDisplay);
  btnCalculate.addEventListener('click', calculate);
  langToggleBtn.addEventListener('click', () => {
    toggleLang();
    renderText();
    // Re-render results if visible
    if (!resultsSection.classList.contains('hidden')) {
      calculate();
    }
  });
}

function switchMode(newMode) {
  mode = newMode;
  tabWakeUp.classList.toggle('active', mode === 'wakeup');
  tabBedTime.classList.toggle('active', mode === 'bedtime');
  panelWakeUp.classList.toggle('hidden', mode !== 'wakeup');
  panelBedTime.classList.toggle('hidden', mode !== 'bedtime');
  resultsSection.classList.add('hidden');
  renderText();
}

function updateSliderDisplay() {
  const val = fallAsleepSlider.value;
  fallAsleepValue.textContent = `${val}${t('fallAsleepUnit')}`;
}

// ─── Render text (i18n) ───────────────────────────────────────────────────────
function renderText() {
  document.querySelector('.app-title').textContent = t('appTitle');
  document.querySelector('.app-subtitle').textContent = t('appSubtitle');
  tabWakeUp.textContent = t('tabWakeUp');
  tabBedTime.textContent = t('tabBedTime');
  document.querySelector('label[for="input-wake-time"]').textContent = t('wakeUpLabel');
  document.querySelector('label[for="input-bed-time"]').textContent = t('bedTimeLabel');
  btnBedNow.textContent = t('bedNowBtn');
  document.querySelector('label[for="fall-asleep-slider"]').textContent = t('fallAsleepLabel');
  btnCalculate.textContent = t('calculateBtn');
  document.querySelector('.footer-text').textContent = t('footer');
  langToggleBtn.textContent = t('langToggle');

  // Legend
  document.querySelectorAll('[data-legend]').forEach((el) => {
    const key = el.dataset.legend;
    el.textContent = t(key);
  });

  updateSliderDisplay();
}

// ─── Calculate ────────────────────────────────────────────────────────────────
function calculate() {
  const fallAsleepMin = parseInt(fallAsleepSlider.value, 10);

  if (mode === 'wakeup') {
    const val = inputWakeTime.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(h, m, 0, 0);

    const options = calculateBedtimes(wakeDate, fallAsleepMin);
    renderResults(options, 'wakeup');
  } else {
    const val = inputBedTime.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const bedDate = new Date();
    bedDate.setHours(h, m, 0, 0);

    const options = calculateWakeUps(bedDate, fallAsleepMin);
    renderResults(options, 'bedtime');
  }
}

// ─── Render results ───────────────────────────────────────────────────────────
function renderResults(options, calcMode) {
  const modeName = calcMode === 'wakeup' ? t('resultsWakeMode') : t('resultsBedMode');
  resultsTitle.textContent = t('resultsTitle').replace('{mode}', modeName);

  resultsList.innerHTML = '';

  options.forEach((opt) => {
    const time = calcMode === 'wakeup'
      ? formatTime(opt.bedtime)
      : formatTime(opt.wakeTime);

    const card = document.createElement('div');
    card.className = `result-card quality-${opt.quality}`;

    const prefix = calcMode === 'wakeup' ? t('bedtimePrefix') : t('wakePrefix');
    const explainKey = `cycleExplain.${opt.cycles}`;
    const explain = t(explainKey);

    card.innerHTML = `
      <div class="card-header">
        <div class="card-time">${time}</div>
        <div class="card-meta">
          <span class="cycles-badge">${opt.cycles} ${t('cyclesUnit')}</span>
          <span class="hours-badge">${opt.sleepHours}${t('sleepHoursUnit')}</span>
          <span class="quality-badge quality-${opt.quality}">${t('quality' + cap(opt.quality))}</span>
        </div>
      </div>
      <div class="card-explain">${explain}</div>
      <div class="sleep-diagram" aria-label="${opt.cycles} sleep cycles diagram">
        ${renderDiagram(opt.cycles)}
      </div>
    `;

    resultsList.appendChild(card);
  });

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Render a simple sleep phase diagram.
 * Each 90-min cycle: light (20min) → deep (40min) → REM (30min)
 */
function renderDiagram(cycles) {
  // Phase proportions within a cycle (out of 90 min)
  const light = 20 / 90;
  const deep = 40 / 90;
  const rem = 30 / 90;

  let html = '<div class="diagram-track">';
  for (let i = 0; i < cycles; i++) {
    html += `<div class="phase phase-light" style="flex:${light}" title="${t('phaseLight')}"></div>`;
    html += `<div class="phase phase-deep" style="flex:${deep}" title="${t('phaseDeep')}"></div>`;
    html += `<div class="phase phase-rem" style="flex:${rem}" title="${t('phaseREM')}"></div>`;
  }
  html += '</div>';
  return html;
}

// ─── Start ────────────────────────────────────────────────────────────────────
init();
