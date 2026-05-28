// YouTube → 홈페이지 UTM 유입 데이터
// Source: Amplitude (gp:initial_utm_source = "youtube") on project 759845
// 자동 갱신은 routine "대시보드 갱신 (UTM Youtube)"이 매일 Notion DB에 함.
// 이 파일 → Notion sync는 별도 단계 (현재는 수동 또는 정적).
window.UTM_YOUTUBE_DATA = {
  source: "youtube",
  property: "gp:initial_utm_source",
  fetchedAt: "2026-05-28T01:50:00Z",
  last7d: 2,
  last30d: 11,
  last90d: 32,
  last365d: 121,
  sinceDataStart: "2025-11-17",
  note: "Amplitude UTM 추적 시작일이 2025-11-17. 그 이전 데이터는 0."
};
