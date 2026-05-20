// 코워크시티 YouTube 셀프 리포트 데이터
// 새 Studio 스샷이 들어올 때마다 이 파일만 수정하면 페이지가 즉시 반영됩니다.

window.REPORT_DATA = {
  channel: {
    name: "코워크시티",
    tagline: "창업 성공 치트키",
    handle: "@coworkcity",
    url: "https://www.youtube.com/@coworkcity",
    logo_letter: "C",
    totals: {
      subscribers: 6833,
      videos: 27
    }
  },
  period: {
    label: "지난 28일",
    from: "2026-04-21",
    to: "2026-05-18"
  },
  metrics_28d: {
    views:            { display: "49.7만",  vs_norm: "평소와 거의 비슷", norm_range: "197,000 ~ 533,000" },
    watch_time_hours: { display: "2.2천 h", vs_norm: "평소와 거의 비슷" },
    new_subscribers:  { display: "+273",    vs_norm: "평소와 거의 비슷" }
  },
  studio_verdict: {
    headline: "분발해 주세요",
    detail:   "채널 조회수가 평소 28일간 197K ~ 533K 범위 안 (49.7만). 평소와 거의 동일한 패턴."
  },
  realtime: { views_48h: 2903 },
  top_content_48h: [
    { rank: 1, title: "직원 채용도 영업이다",       format: "Shorts", views_48h: 1508 },
    { rank: 2, title: "일론머스크의 시간관리",       format: "Shorts", views_48h: 449 },
    { rank: 3, title: "집 주소로 #사업자등록 하면",  format: "Shorts", views_48h: 132 }
  ],
  video_reach: {
    note: "개별 영상 분석 → 도달범위 탭 (게시 이후 누적)",
    videos: [
      {
        title: "홈택스로 사업자 폐업신고하는 법? 이것...",
        duration: "6:00",
        days_since_published: 313,
        impressions: 52000,
        impressions_display: "5.2만",
        ctr_pct: 16.8,
        views: 11000,
        views_display: "1.1만",
        unique_viewers_display: "8.3천",
        topic_tag: "홈택스",
        highlight: true
      },
      {
        title: "[2026년 1월] 홈택스 부가가치세 무실적...",
        duration: "2:41",
        days_since_published: 125,
        impressions: 11000,
        impressions_display: "1.1만",
        ctr_pct: 10.4,
        views: 1400,
        views_display: "1.4천",
        unique_viewers_display: "1.2천",
        topic_tag: "홈택스",
        highlight: true
      },
      {
        title: "직장인이 사업자등록해도 될까? (겸업, ...",
        duration: "4:59",
        days_since_published: 321,
        impressions: 14000,
        impressions_display: "1.4만",
        ctr_pct: 5.0,
        views: 1200,
        views_display: "1.2천",
        unique_viewers_display: "1.1천",
        topic_tag: "사업자등록"
      },
      {
        title: "국제학 출신이 왜 커리어코치를 하냐고요?",
        duration: "9:16",
        days_since_published: 8,
        impressions: 1600,
        impressions_display: "1.6천",
        ctr_pct: 3.2,
        views: 142,
        views_display: "142",
        unique_viewers_display: "67",
        topic_tag: "브랜딩"
      }
    ]
  },
  insight_callout: {
    title: "골든 토픽 발견",
    body: "‘홈택스 + 구체적 절차’ 영상은 CTR 10~17%로 검색 트래픽이 강함. 추상적·질문형 제목은 3~5%로 떨어짐.",
    action: "다음 영상은 ‘홈택스 OOO 하는 법’ 패턴으로 시도해볼 가치 있음."
  },
  hypotheses: [
    { id: "H1", status: "draft", text: "(여기에 다음 영상 가설 입력)" },
    { id: "H2", status: "draft", text: "(예: 쇼츠 30s 후킹 vs 15s 후킹 비교)" },
    { id: "H3", status: "draft", text: "(예: '직원 채용' 토픽 후속 시리즈)" }
  ],
  updated_at: "2026-05-18"
};
