# LocalHub 서울

RFP(개발 의뢰 문서) 기반 서울 권역 지역정보 커뮤니티 MVP. Vue 3 + Vite SPA, 로그인 없는
익명 게시판(localStorage), 한국관광공사 Tour API 데이터 기반 지도 시각화, OpenAI 챗봇으로
구성됩니다.

## 실행 방법

```bash
npm install
cp .env.example .env   # VITE_OPENAI_API_KEY 값 채우기
npm run dev             # 개발 서버
npm run build            # dist/ 에 프로덕션 빌드
```

## 데이터

`public/data/*.json` 은 `scripts/prepare_data.py` 로 원본 Tour API JSON을 프론트엔드용으로
슬림화한 파일입니다 (필드 선별, mapx/mapy → lat/lng 숫자 변환). 원본 데이터 값 자체는
변경하지 않았습니다 (공공누리 3유형 "변경금지" 조건 준수).

원본을 다시 생성하려면:

```bash
python3 scripts/prepare_data.py
```

출처/라이선스 상세는 `docs/SOURCE.md`, 원본 필드 정의는 `docs/SCHEMA.md` 참고.

**⚠️ 확인 필요**: RFP와 `docs/SOURCE.md`에 언급된 `서울_음식점.json`(맛집, 1,632건)이
업로드 파일 목록에 없어 이번 빌드에는 포함하지 못했습니다. 파일을 받으면
`scripts/prepare_data.py`의 `FILES` 딕셔너리에 `"restaurants": ("서울_음식점.json", "음식점")`
한 줄만 추가하고 다시 실행하면 바로 지도/목록/챗봇에 반영됩니다.

## 카테고리 (현재 포함된 7종)

| key | 라벨 | 건수 |
|---|---|---|
| attractions | 관광지 | 783 |
| culture | 문화시설 | 566 |
| festivals | 축제공연행사 | 201 |
| leisure | 레포츠 | 126 |
| shopping | 쇼핑 | 4,368 |
| lodging | 숙박 | 423 |
| courses | 여행코스 | 51 |

기본 화면에는 RFP 필수 항목인 관광지·문화시설·축제만 켜져 있고, 나머지는 필터 칩으로
켤 수 있습니다.

## 폴더 구조

```
src/
  components/   MapView(Leaflet), PlaceCard, ChatbotWidget
  views/        HomeView, PlaceDetailView, BoardListView, BoardDetailView, BoardFormView
  utils/        board.js(게시판 CRUD), places.js(데이터 로더), chatContext.js(챗봇 컨텍스트)
  router/       vue-router 설정
public/data/    전처리된 카테고리별 JSON + categories.json
docs/           SOURCE.md, SCHEMA.md (원본 데이터 출처/스키마)
scripts/        prepare_data.py (원본 → 슬림 JSON 변환)
```

## RFP 요구사항 매핑 (Must have)

- 제공 JSON 기반 지역 커뮤니티 연동 → `public/data/*.json` + `src/utils/places.js`
- 익명 커뮤니티 CRUD (비밀번호 확인) → `src/utils/board.js`, Board* views
- 지역 정보 챗봇 (OpenAI API) → `src/components/ChatbotWidget.vue`
- Vue 3 + Vite SPA → 전체 구조
- 지도 시각화(선정 기능, Leaflet) → `src/components/MapView.vue`
- Netlify 배포 → `public/_redirects` (SPA 라우팅), `npm run build` → `dist/`

## 알려진 제한 사항 / TODO

- 음식점(맛집) 데이터 미포함 (위 확인 필요 항목 참고)
- 챗봇은 질문 키워드로 로컬 데이터에서 관련 항목을 골라 프롬프트에 붙이는 단순 매칭 방식입니다.
  정확도가 중요해지면 임베딩 기반 검색으로 교체를 고려하세요.
- `shopping.json`(약 1.5MB)은 필요할 때만 fetch되지만, 배포 환경에 따라 첫 로드가 느릴 수
  있습니다. 실사용 시 페이지네이션/서버 검색 도입을 검토하세요.
