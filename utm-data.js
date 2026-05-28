// YouTube → 홈페이지 유입 데이터 (referrer 기준)
// Source: Amplitude (gp:initial_referring_domain contains "youtube") on project 759845
// 측정 방식: referrer 기반 (영상 설명의 UTM 파라미터 없이도 잡힘)
// 자동 갱신: routine "대시보드 갱신 (UTM Youtube)" → Notion DB 매일 갱신
window.UTM_YOUTUBE_DATA = {
  source: "youtube",
  property: "gp:initial_referring_domain",
  measurementMethod: "referrer",
  fetchedAt: "2026-05-28T03:00:00Z",
  thisWeek: 6,           // 5/22~5/28
  thisMonth: 70,         // 5/1~5/28 (진행 중)
  lastMonth: 334,        // 4월 전체
  thisYear: 730,         // 2026년 누적
  lastYear: 142,         // 2025년
  note: "Amplitude의 referrer 기반 unique 카운트. 영상 설명에 utm 파라미터 없어도 잡힘. 광고 차단 / 직접 검색 유입 등은 별도로 분류됨."
};
