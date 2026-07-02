# 실제 사운드 에셋 소싱 가이드

현재 Web Audio 합성음 → 실제 필드 레코딩으로 교체하면 품질이 극적으로 올라갑니다.
모두 **CC0 / 상업 허용** 라이선스를 확인 후 사용하세요.

## 소싱 목록 (Freesound.org 추천 검색어)

### 비멍 (rain)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 메인 빗소리 | `heavy rain ambient loop CC0` | 2~3분 루프 |
| 천둥 | `thunder distant rumble` | 랜덤 트리거용 |
| 유리창 빗소리 | `rain on window glass` | 전경 레이어 |

### 산사멍 (sansa)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 풍경 (wind bell) | `japanese wind chime bell` 또는 `korean wind bell temple` | 단발 트리거용 |
| 목탁 | `wooden knock percussion` 또는 `woodblock` | 단발 트리거용 |
| 계곡물 | `forest stream water loop` | 배경 루프 |
| 새소리 | `birds dawn forest morning` | 새벽 레이어 |

### 불멍 (fire)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 장작 불 | `campfire crackling loop` | 배경 루프 |
| 타닥 소리 | `fire pop crackle` | 랜덤 트리거용 |

### 물멍 (water)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 수중 환경음 | `underwater ambient bubbles loop` | 배경 루프 |
| 물방울 | `water drip drop` | 랜덤 트리거용 |

### 파도멍 (wave)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 해변 파도 | `ocean waves beach loop` | 배경 루프 |
| 파도 부서짐 | `wave crash shore` | 파도 사이클 트리거 |

### 구름멍 (cloud)
| 파일 목적 | 검색어 | 비고 |
|---|---|---|
| 바람 | `gentle wind ambient loop` | 배경 루프 |

---

## 파일 준비 방법

1. Freesound.org 다운로드 (wav 또는 mp3)
2. [Audacity](https://www.audacityteam.org/) 무료 툴로 루프 편집 (시작·끝 페이드 추가)
3. mp3 128kbps로 export (스트리밍 최적화)
4. `public/sounds/{theme}/` 폴더에 배치

```
public/
  sounds/
    rain/
      rain-main.mp3      ← 메인 빗소리 루프
      thunder.mp3        ← 천둥 (단발)
      rain-window.mp3    ← 유리창 빗소리 루프
    sansa/
      wind-bell.mp3      ← 풍경 (단발, 여러 개 준비)
      moktak.mp3         ← 목탁 (단발)
      stream.mp3         ← 계곡물 루프
      birds.mp3          ← 새소리 루프
    fire/
      fire-loop.mp3
      crackle.mp3
    water/
      underwater.mp3
      bubble.mp3
    wave/
      waves-loop.mp3
    cloud/
      wind-loop.mp3
```

---

## Vercel Blob 업로드

```bash
# Vercel CLI로 직접 업로드
vercel blob put public/sounds/rain/rain-main.mp3 --public

# 또는 Vercel 대시보드 → Storage → Blob → Upload
```

업로드 후 반환된 URL을 `src/lib/soundAssets.ts`에 등록합니다.

---

## 코드 통합 (파일 준비 후 진행)

`public/sounds/` 에 파일 배치 후 개발자에게 알려주시면 바로 통합합니다.
Web Audio 합성음과 실제 파일을 레이어링해서 더 풍부한 사운드를 만듭니다.
