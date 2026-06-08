// Amplitude Dashboard REST API로 referrer = youtube.com 유저 수 가져와서 utm-data.js 생성
// 사용법: node fetch-amplitude-referrer.js
// 의존성: 없음 (Node 18+ 내장 fetch)
// 필요: .env 의 AMPLITUDE_API_KEY, AMPLITUDE_SECRET_KEY

const fs = require('fs');
const path = require('path');

// .env 파싱 (KEY=VALUE 라인만)
const env = {};
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const API_KEY = env.AMPLITUDE_API_KEY;
const SECRET_KEY = env.AMPLITUDE_SECRET_KEY;
if (!API_KEY || !SECRET_KEY) {
  console.error('ERROR: AMPLITUDE_API_KEY / AMPLITUDE_SECRET_KEY 가 .env 에 없음');
  console.error('Amplitude → Settings → Projects → "default" → API Key / Secret Key 복사해서 youtube-report/.env 에 추가');
  process.exit(1);
}

const AUTH = 'Basic ' + Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString('base64');
const BASE = 'https://amplitude.com/api/2/events/segmentation';

const EVENT_DEF = {
  event_type: '_active',
  filters: [{
    subprop_type: 'user',
    subprop_key: 'gp:initial_referring_domain',
    subprop_op: 'is',
    subprop_value: ['youtube.com']
  }]
};

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// interval을 기간 길이로 잡아 단일 버킷화 → series[0] 합계가 그 기간의 deduped uniques
async function queryRange(label, start, end, interval) {
  const url = new URL(BASE);
  url.searchParams.set('e', JSON.stringify(EVENT_DEF));
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);
  url.searchParams.set('m', 'uniques');
  url.searchParams.set('i', String(interval));

  const res = await fetch(url, { headers: { Authorization: AUTH } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${label}] Amplitude ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const series = (json && json.data && json.data.series && json.data.series[0]) || [];
  return series.reduce((a, b) => a + (Number(b) || 0), 0);
}

(async () => {
  const now = new Date();

  // 월요일 시작 주
  const dow = now.getDay() === 0 ? 7 : now.getDay(); // 일=7
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - (dow - 1));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

  console.log('Querying Amplitude (referrer = youtube.com)...');
  const [thisWeek, thisMonth, lastMonth, thisYear, lastYear] = await Promise.all([
    queryRange('thisWeek',  fmt(weekStart),       fmt(now),          7),
    queryRange('thisMonth', fmt(monthStart),      fmt(now),          30),
    queryRange('lastMonth', fmt(lastMonthStart),  fmt(lastMonthEnd), 30),
    queryRange('thisYear',  fmt(yearStart),       fmt(now),          365),
    queryRange('lastYear',  fmt(lastYearStart),   fmt(lastYearEnd),  365),
  ]);

  const out = {
    source: 'youtube',
    property: 'gp:initial_referring_domain',
    measurementMethod: 'referrer',
    fetchedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    thisWeek, thisMonth, lastMonth, thisYear, lastYear,
    note: 'Amplitude referrer 기반 (first-touch). utm 태그 없이도 추적됨.'
  };

  const js =
    '// YouTube → 홈페이지 유입 (referrer 기준) — Amplitude live\n' +
    '// refresh: ./refresh-utm.ps1 (Amplitude Dashboard REST API)\n' +
    '// 정의: _active 이벤트, gp:initial_referring_domain = "youtube.com", deduped uniques\n' +
    'window.UTM_YOUTUBE_DATA = ' + JSON.stringify(out) + ';\n';

  fs.writeFileSync(path.join(__dirname, 'utm-data.js'), js, 'utf-8');

  console.log('✅ utm-data.js refreshed');
  console.log(`   thisWeek:  ${thisWeek}`);
  console.log(`   thisMonth: ${thisMonth}`);
  console.log(`   lastMonth: ${lastMonth}`);
  console.log(`   thisYear:  ${thisYear}`);
  console.log(`   lastYear:  ${lastYear}`);
  console.log(`   Time:      ${out.fetchedAt}`);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
