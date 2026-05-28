// YouTube Data API v3로 채널 통계 + 최근 영상 가져와서 youtube-data.js 생성
// 사용법: node fetch-youtube.js
// 의존성: 없음 (Node 18+ 내장 fetch / https)

const fs = require('fs');
const path = require('path');

const HANDLES = ['@coworkcity_official', '@coworkcity'];
// 쇼츠 분류 규칙:
//   - 0초 < d ≤ SHORT_CONFIRMED_SECONDS  → 무조건 쇼츠
//   - SHORT_CONFIRMED_SECONDS < d ≤ SHORT_MAX_SECONDS → URL redirect 체크로 정밀 판별
//   - d > SHORT_MAX_SECONDS → 무조건 롱폼
const SHORT_CONFIRMED_SECONDS = 60;
const SHORT_MAX_SECONDS = 180;
const REDIRECT_CONCURRENCY = 10;
const API = 'https://www.googleapis.com/youtube/v3';

// AI 추천 콘텐츠: 창업 관련 키워드의 최근 7일 인기 영상
const TRENDING_KEYWORDS = ['창업', '부업', 'AI 부업', '1인 창업'];
const TRENDING_LOOKBACK_DAYS = 7;
const TRENDING_TOP_N = 8;
const OUR_CHANNEL_IDS = new Set(['UCYJSMJqhN65hk8eTOsGQRqQ', 'UCgoj_pKzK318BpvhJsvc14Q']);

function parseDurationSeconds(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const mi = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + mi * 60 + s;
}

// /shorts/{id} URL이 redirect되면 일반 영상, 아니면 쇼츠
async function checkIsShortByUrl(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: 'HEAD',
      redirect: 'manual'
    });
    return res.status === 200;
  } catch {
    return null; // 네트워크 오류 시 null 반환 → 길이로 fallback
  }
}

async function refineAmbiguousVideos(videos) {
  const ambiguous = videos.filter(v =>
    v.durationSeconds > SHORT_CONFIRMED_SECONDS &&
    v.durationSeconds <= SHORT_MAX_SECONDS
  );
  if (!ambiguous.length) return 0;

  let checked = 0;
  for (let i = 0; i < ambiguous.length; i += REDIRECT_CONCURRENCY) {
    const chunk = ambiguous.slice(i, i + REDIRECT_CONCURRENCY);
    await Promise.all(chunk.map(async v => {
      const result = await checkIsShortByUrl(v.id);
      if (result !== null) {
        v.isShort = result;
        checked++;
      }
    }));
  }
  return checked;
}

function loadApiKey() {
  const envPath = path.join(__dirname, '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*YOUTUBE_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1];
  }
  throw new Error('YOUTUBE_API_KEY not found in .env');
}

async function api(endpoint, params, key) {
  const qs = new URLSearchParams({ ...params, key }).toString();
  const res = await fetch(`${API}/${endpoint}?${qs}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${endpoint} failed: ${res.status} ${body}`);
  }
  return res.json();
}

async function fetchAllVideoIds(uploadsId, key) {
  const ids = [];
  let pageToken;
  do {
    const params = {
      part: 'contentDetails',
      playlistId: uploadsId,
      maxResults: 50
    };
    if (pageToken) params.pageToken = pageToken;
    const res = await api('playlistItems', params, key);
    ids.push(...res.items.map(i => i.contentDetails.videoId));
    pageToken = res.nextPageToken;
  } while (pageToken);
  return ids;
}

async function fetchAllVideosMeta(ids, key) {
  const items = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const res = await api('videos', {
      part: 'snippet,statistics,contentDetails',
      id: chunk.join(',')
    }, key);
    items.push(...res.items);
  }
  return items;
}

async function fetchTrendingStartup(key) {
  const publishedAfter = new Date(Date.now() - TRENDING_LOOKBACK_DAYS * 86400000).toISOString();
  const allVideoIds = new Set();
  const seedByKeyword = {};

  for (const kw of TRENDING_KEYWORDS) {
    try {
      const res = await api('search', {
        part: 'snippet',
        q: kw,
        type: 'video',
        order: 'viewCount',
        publishedAfter,
        regionCode: 'KR',
        relevanceLanguage: 'ko',
        maxResults: 10
      }, key);
      const ids = (res.items || []).map(i => i.id.videoId).filter(Boolean);
      ids.forEach(id => allVideoIds.add(id));
      seedByKeyword[kw] = ids;
    } catch (e) {
      console.error(`  ✗ trending "${kw}": ${e.message}`);
      seedByKeyword[kw] = [];
    }
  }

  if (allVideoIds.size === 0) {
    return { keywords: TRENDING_KEYWORDS, lookbackDays: TRENDING_LOOKBACK_DAYS, fetchedAt: new Date().toISOString(), videos: [] };
  }

  const items = await fetchAllVideosMeta([...allVideoIds], key);

  const videos = items
    .filter(v => !OUR_CHANNEL_IDS.has(v.snippet.channelId))
    .map(v => {
      const matchedKws = TRENDING_KEYWORDS.filter(kw => (seedByKeyword[kw] || []).includes(v.id));
      const durationSeconds = parseDurationSeconds(v.contentDetails.duration);
      return {
        id: v.id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        channelId: v.snippet.channelId,
        publishedAt: v.snippet.publishedAt,
        duration: v.contentDetails.duration,
        durationSeconds,
        isShort: durationSeconds > 0 && durationSeconds <= SHORT_CONFIRMED_SECONDS,
        thumbnail: v.snippet.thumbnails?.medium?.url ?? null,
        views: parseInt(v.statistics.viewCount ?? '0', 10),
        likes: parseInt(v.statistics.likeCount ?? '0', 10),
        comments: parseInt(v.statistics.commentCount ?? '0', 10),
        url: `https://www.youtube.com/watch?v=${v.id}`,
        matchedKeywords: matchedKws
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, TRENDING_TOP_N);

  return {
    keywords: TRENDING_KEYWORDS,
    lookbackDays: TRENDING_LOOKBACK_DAYS,
    fetchedAt: new Date().toISOString(),
    videos
  };
}

async function fetchChannel(handle, key) {
  // 1. 채널 메타 + uploads playlist ID
  const chRes = await api('channels', {
    part: 'snippet,statistics,contentDetails',
    forHandle: handle
  }, key);

  if (!chRes.items?.length) {
    throw new Error(`Channel ${handle} not found`);
  }

  const ch = chRes.items[0];
  const uploadsId = ch.contentDetails.relatedPlaylists.uploads;

  // 2. 전체 영상 ID 페이지네이션으로 가져오기
  const videoIds = await fetchAllVideoIds(uploadsId, key);

  // 3. 영상별 통계 + 제목 (50개씩 chunk)
  const vItems = videoIds.length ? await fetchAllVideosMeta(videoIds, key) : [];

  const videos = vItems.map(v => {
    const durationSeconds = parseDurationSeconds(v.contentDetails.duration);
    // 1차 길이 기반 분류 (60초 이하 = 쇼츠 확정, 180초 초과 = 롱폼 확정, 사이는 잠정 쇼츠)
    const provisionalShort = durationSeconds > 0 && durationSeconds <= SHORT_MAX_SECONDS;
    return {
      id: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      duration: v.contentDetails.duration,
      durationSeconds,
      isShort: provisionalShort,
      thumbnail: v.snippet.thumbnails?.medium?.url ?? null,
      views: parseInt(v.statistics.viewCount ?? '0', 10),
      likes: parseInt(v.statistics.likeCount ?? '0', 10),
      comments: parseInt(v.statistics.commentCount ?? '0', 10),
      url: `https://www.youtube.com/watch?v=${v.id}`
    };
  });

  // 60-180초 구간만 URL redirect로 정밀 판별
  const refined = await refineAmbiguousVideos(videos);
  if (refined) {
    console.log(`    · 60-180s 구간 ${refined}개 정밀 분류 완료`);
  }

  // 채널 통계의 viewCount가 작은 채널/쇼츠 위주 채널에서 부정확한 경우가 있어 영상 합산으로 대체
  const totalViewsSum = videos.reduce((s, v) => s + v.views, 0);

  return {
    handle,
    channelId: ch.id,
    title: ch.snippet.title,
    description: ch.snippet.description,
    publishedAt: ch.snippet.publishedAt,
    thumbnail: ch.snippet.thumbnails?.medium?.url ?? null,
    url: `https://www.youtube.com/${handle}`,
    subscribers: parseInt(ch.statistics.subscriberCount ?? '0', 10),
    totalViews: totalViewsSum,
    totalViewsApi: parseInt(ch.statistics.viewCount ?? '0', 10),
    videoCount: parseInt(ch.statistics.videoCount ?? '0', 10),
    recentVideos: videos
  };
}

async function main() {
  const key = loadApiKey();
  console.log(`[${new Date().toISOString()}] Fetching ${HANDLES.length} channels...`);

  const channels = [];
  for (const h of HANDLES) {
    try {
      const c = await fetchChannel(h, key);
      const shortCount = c.recentVideos.filter(v => v.isShort).length;
      const longCount = c.recentVideos.length - shortCount;
      console.log(`  ✓ ${h} — ${c.subscribers.toLocaleString()} subs, ${c.videoCount} total, ${c.recentVideos.length} fetched (${shortCount} shorts / ${longCount} long)`);
      channels.push(c);
    } catch (e) {
      console.error(`  ✗ ${h} — ${e.message}`);
    }
  }

  console.log(`\nFetching trending startup content...`);
  let trendingStartup;
  try {
    trendingStartup = await fetchTrendingStartup(key);
    console.log(`  ✓ trending: ${trendingStartup.videos.length} videos curated from ${TRENDING_KEYWORDS.join(', ')}`);
  } catch (e) {
    console.error(`  ✗ trending failed: ${e.message}`);
    trendingStartup = { keywords: TRENDING_KEYWORDS, lookbackDays: TRENDING_LOOKBACK_DAYS, fetchedAt: new Date().toISOString(), videos: [], error: e.message };
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    channels,
    trendingStartup
  };

  const out = `// YouTube API 자동 수집 데이터\n// 갱신: node fetch-youtube.js  (또는 ./refresh-youtube.ps1)\nwindow.YOUTUBE_API_DATA = ${JSON.stringify(payload, null, 2)};\n`;

  const outPath = path.join(__dirname, 'youtube-data.js');
  fs.writeFileSync(outPath, out, 'utf8');

  console.log(`\n✅ youtube-data.js refreshed`);
  console.log(`   Channels: ${channels.length}/${HANDLES.length}`);
  console.log(`   Time:     ${payload.fetchedAt}`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
