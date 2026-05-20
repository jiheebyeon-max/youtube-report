// 코워크시티 YouTube 셀프 리포트 데이터
// 새 Studio 스샷이 들어올 때마다 해당 기간 객체만 갈아끼우면 페이지가 즉시 반영됩니다.

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

  // 현재 기본 선택 기간 (d7 / d28 / d90 / d365 / ltm / custom)
  current_period: "d28",

  // 기간별 지표 — 데이터 없는 기간은 data: null
  // 새 스샷 들어올 때마다 해당 키만 채워주면 UI에 자동 반영됩니다.
  periods: {
    d7: {
      label: "지난 7일",
      data: null
    },
    d28: {
      label: "지난 28일",
      from: "2026-04-21",
      to:   "2026-05-18",
      data: {
        views:            { display: "49.7만",  vs_norm: "평소와 거의 비슷", norm_range: "197,000 ~ 533,000" },
        watch_time_hours: { display: "2.2천 h", vs_norm: "평소와 거의 비슷" },
        new_subscribers:  { display: "+273",    vs_norm: "평소와 거의 비슷" }
      },
      verdict: {
        headline: "분발해 주세요",
        detail:   "채널 조회수가 평소 28일간 197K ~ 533K 범위 안 (49.7만). 평소와 거의 동일한 패턴."
      }
    },
    d90: {
      label: "지난 90일",
      data: null
    },
    d365: {
      label: "지난 365일",
      data: null
    },
    ltm: {
      label: "게시 이후",
      data: null
    },
    custom: {
      label: "기간 설정",
      from: null,
      to:   null,
      data: null
    }
  },

  realtime: { views_48h: 2903 },

  // 쇼츠 누적 조회수 — 콘텐츠 탭 리스트가 들어오면 자동 채움
  // 형식: { title, views_cumulative, views_display, published_days_ago }
  top_shorts: {
    note: "쇼츠 누적 조회수 — 콘텐츠 탭 리스트로 채움",
    videos: null
  },

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
