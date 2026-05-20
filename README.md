# 코워크시티 · YouTube 셀프 리포트

[@coworkcity](https://www.youtube.com/@coworkcity) 채널 운영용 셀프 대시보드.

## 어떻게 업데이트하나

데이터는 전부 `data.js` 한 파일에 있다. YouTube Studio 새 스샷이 들어올 때마다 이 파일의 해당 필드만 갈아끼우면 페이지가 즉시 반영한다.

가장 자주 바뀌는 곳:
- `metrics_28d.views.display` — "49.7만" 같은 표시값
- `metrics_28d.views.vs_norm` — "평소와 거의 비슷" / "평소보다 높음" / "평소보다 낮음"
- `top_content_48h[]` — 실시간 박스의 인기 콘텐츠 3개
- `realtime.views_48h` — 48시간 조회수
- `hypotheses[]` — 다음 영상 가설 입력
- `updated_at` — 갱신 날짜

## 로컬 미리보기

`index.html`을 그대로 더블클릭해서 브라우저에서 열면 된다. `data.js`는 `<script>`로 로드되기 때문에 `file://`에서도 정상 동작한다.

## Vercel 배포

이 폴더 그대로 Vercel에 올리면 정적 사이트로 호스팅된다. CLI 한 줄:

```powershell
cd c:\Users\CoworkcityJinisoo\AI편집\youtube-report
npx vercel deploy
# 첫 배포 시 로그인 + 프로젝트 이름 묻는 절차만 따라가면 됨
```

또는 GitHub에 푸시 → Vercel 대시보드에서 Import.

## 섹션 구성

1. **북극성 지표** — 구독자 / 조회수 / 시청 시간 / 신규 구독자 (28일)
2. **Studio 평가** — YouTube 자동 코멘트 ("분발해 주세요" 류 시그널)
3. **TOP 콘텐츠 (48h)** — 실시간 박스 인기 영상
4. **다음 영상 가설 트래커** — 운영자가 직접 가설을 적고 검증해 나가는 영역

추가로 받고 싶은 화면이 생기면 (예: 도달범위 탭, 시청자층 탭, 콘텐츠 탭) 그때 새 섹션을 추가하면 된다.
