# 오늘의 멍 · 유료화 실행 계획 (테스트 검증 기반)

> 작성일: 2026-07-02
> 성격: [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)가 "무엇을/왜"의 전략이라면, 이 문서는
> **실제 라이브 배포를 테스트하며 확인한 현실**과 그에 근거한 **"지금 무엇부터"의 실행 계획**이다.
> 대상 배포: `today-meong.vercel.app` (repo: `jjttuk7-bit/today-meong`)

---

## 1. 이번 세션에서 실제로 한 일 (완료)

| # | 작업 | 커밋 | 결과 |
|---|---|---|---|
| 1 | 설정창 즉시 닫힘 버그 수정 (패널 열림 중 4.5초 자동숨김 방지, ref 가드) | `9af86ce` | 설정 패널 유지됨 |
| 2 | 보이스 선택 localStorage 영속화 (`meong.voice.v1`) | `9af86ce` | 재방문 시 선택 보이스 유지 |
| 3 | TTS 엔진 진단 계측 추가 (`X-TTS-Engine` 헤더, `/api/health`, 503 상세) | `e50f789` | 어떤 엔진이 쓰였는지 검증 가능 |
| 4 | ElevenLabs 실패 사유를 OpenAI 폴백 에러와 함께 표면화 | `c26dcdf` | 근본 원인 규명 완료 |

### 새로 생긴 검증 도구 (앞으로 상시 활용)
- **`/api/health`** — 브라우저로 열면 배포가 인식하는 키를 즉시 확인
  ```json
  {"keys":{"openai":true,"elevenlabs":true,"blob":false},"tts":"elevenlabs"}
  ```
- **응답 헤더 `X-TTS-Engine`** — 성공 시 `elevenlabs` / `openai` 표시 (DevTools → Network → tts → Headers)
- **503 본문 `detail`** — 실패 시 제공사 원본 에러를 그대로 노출

---

## 2. 테스트로 드러난 냉정한 현실

### 2-1. 나레이션이 "기계음"이던 진짜 원인 — 코드가 아니라 결제
라이브 엔드포인트를 직접 호출해 확인한 실제 에러:

| 엔진 | 원본 에러 | 의미 |
|---|---|---|
| ElevenLabs (1순위) | `Status code: 402` | **결제 필요** — 무료 글자 할당량 소진 |
| OpenAI (폴백) | `429 exceeded your current quota` | 크레딧 없음 / 결제 미설정 |

두 유료 TTS가 모두 요청을 거부 → 앱이 브라우저 내장 `speechSynthesis`(진짜 로봇 음성)로 폴백.
추가로 `analyze-mood`도 하드코딩 폴백 문구를 반환 → **OpenAI 크레딧 소진이 앱 전체 AI 품질을 무력화**하고 있었음.

> **교훈:** Vercel 환경변수는 추가 후 **재배포**되어야 적용된다. 그리고 키가 "인식"되는 것과
> 계정에 "잔액"이 있는 것은 별개다. 이번 진단 계측이 없었다면 계속 코드를 의심했을 것.

### 2-2. 이 사건이 노출한 구조적 취약점
1. **단일 결제 실패 = 전체 서비스 체감 붕괴.** 유료 서비스에서 이건 치명적. 관측·알림 부재로 "조용히" 망가짐.
2. **폴백 품질 절벽.** AI 실패 시 폴백(로봇 음성 / 정적 문구)이 유료 기대치와 너무 멀다. 폴백도 "돈 낸 값"은 해야 함.
3. **원가 = 사용량.** 세션마다 OpenAI/ElevenLabs 호출 → 무료 유저가 늘수록 이번 같은 quota 소진이 반복. [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md#️-결정적-리스크--단위경제unit-economics)의 단위경제 리스크가 실측으로 확인됨.

---

## 3. 유료화 게이트 — 이걸 못 넘으면 결제 붙이면 안 됨

돈을 받기 전에 **반드시** 통과해야 하는 최소 요건. (품질이 아니라 "돈 받을 자격")

- [ ] **G1. 나레이션이 항상 성우급으로 들린다.** ElevenLabs 안정화 + 실패 시에도 로봇 음성 금지(→ §4-1)
- [ ] **G2. 결제/키 실패가 자동 감지·알림된다.** `/api/health` 모니터링 + 에러 알림(→ §4-2)
- [ ] **G3. 세션당 AI 원가가 0에 수렴한다.** 나레이션·이미지 사전생성/캐시(→ §4-3)
- [ ] **G4. 재방문 이유가 있다.** 계정/히스토리/스트릭 (local-first 일부 완료, 계정 연동 필요)
- [ ] **G5. "돈 낼 이유" 콘텐츠 1개가 완성형이다.** 프로그램 1개를 처음부터 끝까지 프리미엄 품질로

---

## 4. 우선순위 실행 계획

### 4-1. 나레이션 품질 안정화 【최우선 · G1】
문제: 유료 TTS 실패 시 브라우저 로봇 음성으로 추락. 나레이션은 이 앱의 핵심 감성 자산.

- [ ] **ElevenLabs 계정 정상화** — 잔액/플랜 확인, Starter 이상으로 결제 안정화 (사용자 액션)
- [ ] **OpenAI 결제 정상화** — 폴백 경로 복구 (사용자 액션)
- [ ] **나레이션 사전 생성 + 저장** — 멘트는 테마×무드 조합으로 유한하다. 세션마다 TTS를 호출하지 말고
      한 번 생성해 Vercel Blob(또는 `public/audio/`)에 저장 후 재사용 → 원가 0 + 실패 위험 제거
- [ ] **폴백 품질 상향** — TTS 완전 실패 시 브라우저 음성 대신 **사전 녹음된 나레이션 오디오**로 폴백.
      최악의 경우에도 로봇 음성은 절대 사용자에게 도달하지 않게
- [ ] **클라이언트 폴백 로직 개선** — 현재 [MeditationPlayback.tsx](../src/components/MeditationPlayback.tsx)의
      `ttsUnavailableRef`는 한 번 실패하면 세션 내내 로봇 음성 고정. 일시적 실패와 영구 실패를 구분

### 4-2. 관측·자가진단 【G2】
문제: 이번 장애를 사용자 제보로 알았다. 유료 서비스는 스스로 알아야 한다.

- [ ] **`/api/health` 주기 모니터링** — Vercel Cron 또는 외부 uptime 모니터가 `keys`와 실제 TTS 200 여부를 점검, 실패 시 알림
- [ ] **Sentry(에러) + PostHog(행동) 연동** — [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md#7-기술-기반-infra) §7과 연계
- [ ] **AI 호출 성공률/원가 대시보드** — 제공사별 호출 수·실패율·추정 비용을 한눈에

### 4-3. 단위경제 방어 【G3】
문제: 무료 유저 증가 = quota 소진 = 이번 장애 반복.

- [ ] **AI 에셋 사전 생성 파이프라인** — 테마(6)×무드(5) = 30조합의 배경 이미지·나레이션을 **빌드/배포 시 1회 생성**해 캐시. 런타임 AI 호출을 0으로
- [ ] **Vercel Blob 활성화** — 현재 `blob:false` (토큰 미설정). 이미지 캐시가 실제로는 매번 재생성 중일 가능성. Blob 스토어 연결 필요
- [ ] **실시간 생성은 프리미엄 전용 + 레이트리밋** — "매번 새로 생성"은 마케팅 후크로 유지하되 원가는 유료 구간으로 격리
- [ ] **무료 티어에 하드 쿼터** — IP/세션 기준 일일 AI 호출 상한

### 4-4. 유료 전환 준비 【G4·G5】
- [ ] **계정/인증** — local-first 히스토리를 Supabase Auth로 승격, 기기 간 동기화
- [ ] **프리미엄 품질 프로그램 1개 완성** — "7일 숙면 여정"을 사전 녹음 나레이션 + 큐레이션 사운드 + 검증된 비주얼로 끝까지 완성해 "이건 돈 값 한다"의 레퍼런스로
- [ ] **Freemium 경계 + Stripe** — [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md#부록-프리미엄-티어-경계-초안) 티어표 기준, 7일 체험

---

## 5. 콘텐츠·감성 품질 (유료 기대치 격차)

테스트하며 느낀 "아직 돈 낼 정도는 아니다"의 구체적 항목:

- **나레이션 멘트 다양성 부족** — 테마×무드당 5줄 고정. 매일 같으면 금세 질림. 멘트 풀 확대 + 로테이션
- **사운드가 합성음 티** — [SOUND-ASSETS.md](./SOUND-ASSETS.md) 가이드대로 필드 레코딩 루프로 교체 (특히 비멍/산사멍)
- **비주얼 일관성/모바일 성능** — 절차적 캔버스는 wow는 있으나 저사양에서 끊김. [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md#3-비주얼-visual) §3 WebGL 전환 검토
- **온보딩 부재** — 첫 방문 30초 내 "아하 모먼트" 설계 없음
- **산사멍(한국멍) 확장** — 반응 좋으면 눈멍/대나무숲멍/달멍으로 차별화된 카테고리 구축

---

## 6. 다음 액션 (사용자 vs 개발)

### 지금 사용자가 할 일 (결제·계정)
1. **ElevenLabs** — [elevenlabs.io](https://elevenlabs.io) Usage/Subscription 확인 → 잔액 소진이면 유료 전환
2. **OpenAI** — [billing](https://platform.openai.com/settings/organization/billing) 크레딧 충전
3. 정상화 후 `today-meong.vercel.app/api/health` 및 실제 나레이션으로 재검증 (`X-TTS-Engine: elevenlabs` 확인)
4. **Vercel Blob 스토어 연결** (이미지/오디오 캐시용, 현재 `blob:false`)

### 개발이 이어서 할 일 (착수 순서)
1. **나레이션 사전 생성 + 오디오 폴백** (§4-1) — G1 해소, 로봇 음성 영구 제거
2. **`/api/health` 모니터링 + 알림** (§4-2) — G2
3. **AI 에셋 사전 생성 파이프라인 + Blob 활성화** (§4-3) — G3, 단위경제 방어
4. **프리미엄 레퍼런스 프로그램 1개 완성** (§4-4) — G5

---

## 부록: 재검증 체크리스트 (결제 정상화 후)

```bash
# 1. 키 인식 확인
curl -s https://today-meong.vercel.app/api/health

# 2. 실제 나레이션이 ElevenLabs로 나오는지 (헤더 확인)
curl -sI -X POST https://today-meong.vercel.app/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"천천히 숨을 들이마시고 부드럽게 내쉽니다.","voice":"AZnzlk1XvdvUeBnXmlld"}' \
  | grep -i x-tts-engine
# 기대값: X-TTS-Engine: elevenlabs

# 3. mood 분석이 AI 생성인지 (폴백 문구가 아닌지)
curl -s -X POST https://today-meong.vercel.app/api/analyze-mood \
  -H "Content-Type: application/json" \
  -d '{"theme":"rain","moodText":"발표 때문에 긴장했어","moodQuick":"anxiety"}'
# 기대값: greeting이 입력 맥락("발표/긴장")을 반영한 새 문장
```
