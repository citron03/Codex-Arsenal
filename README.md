# Codex-Arsenal

> OpenAI Codex / Claude Code 기반 개발 경험을 극대화하기 위한  
> 플러그인 · 스킬 · 워크플로 · 설정 · 프롬프트 큐레이션 레포지토리.

---

## 🧭 이 레포는 무엇인가?

**Codex-Arsenal**은 AI 코딩 에이전트(OpenAI Codex, Claude Code 등)를 실무에 적용하면서  
"vanilla setup만으로는 부족하다"고 느낀 개발자들을 위한 실용 자료 모음입니다.

단순한 awesome list와 다른 점:

- 실제로 써봤거나, 체감 생산성이 검증된 것만 수록
- setup → 사용법 → 주의사항까지 한 곳에서 해결
- 개인 개발자 / 소규모 팀 모두를 대상으로 함
- Claude Code 스타일의 agentic workflow에 최적화

> **대상 독자:** 이미 Codex 또는 Claude Code를 써본 개발자.  
> AI 코딩 도구가 처음이라면 [공식 문서](https://platform.openai.com/docs/guides/code)부터 시작하세요.

---

## 📂 레포지토리 구조

```
codex-arsenal/
├── plugins/          # 에이전트 기능을 확장하는 플러그인 모음
├── skills/           # 재사용 가능한 에이전트 스킬 패키지
├── prompts/          # 프롬프트 템플릿 및 system prompt 예제
├── workflows/        # 워크플로 정의 및 실행 스크립트
├── configs/          # .codex, VSCode, zsh, tmux 등 설정 파일
├── references/       # 논문 · 블로그 · 주목할 GitHub 레포 링크
├── examples/         # 실전 데모 및 before/after 예제
└── README.md
```

---

## ✨ 수록 콘텐츠 카테고리

### 🔌 Plugins

에이전트 자체 기능을 보강하는 플러그인.

현재 수록 중 / 예정:

| 이름 | 설명 | 상태 |
|------|------|------|
| context-window-compressor | 긴 대화 컨텍스트를 압축해 토큰 절약 | 준비 중 |
| git-diff-helper | PR diff 요약 및 리뷰 요청 자동화 | 준비 중 |
| multi-agent-router | 여러 에이전트에 작업을 분배하는 라우터 | 계획 중 |
| repo-memory | 프로젝트 구조를 기억하는 메모리 레이어 | 계획 중 |

---

### 🧠 Skills

반복 작업에서 즉시 꺼내 쓸 수 있는 스킬셋.

| 스킬 | 설명 |
|------|------|
| `debug-workflow` | 에러 로그 → 원인 분석 → 수정 → 재현 테스트까지 파이프라인화 |
| `pr-reviewer` | PR diff를 받아 리뷰 코멘트를 자동 생성 |
| `test-gen` | 함수 시그니처와 코드를 보고 유닛 테스트 자동 생성 |
| `refactor-pipeline` | 코드 품질 분석 → 리팩터링 제안 → 적용까지 단계 처리 |
| `doc-gen` | 코드베이스에서 README, API 문서 자동 작성 |
| `arch-analysis` | 레포 전체 구조를 분석해 의존성 맵 생성 |

---

### ⚙️ Configs

실제 사용 중인 설정 파일 모음. 복붙 후 바로 사용 가능한 형태로 제공.

- `.codex/config.json` — Codex 에이전트 기본 설정 프리셋
- `settings.json` — VSCode + Codex 통합 설정
- `system-prompts/` — 역할별 system prompt 템플릿 (solo dev / 팀 / 레거시 분석)
- `.zshrc` 스니펫 — Codex CLI alias 및 단축키 모음
- `tmux.conf` — AI 세션을 병렬로 띄우기 위한 tmux 레이아웃

---

### 🧩 Workflows

"어떻게 써야 잘 쓰는가"에 대한 실전 운영 방식.

| 워크플로 | 대상 | 핵심 아이디어 |
|----------|------|---------------|
| `solo-dev-loop` | 혼자 개발하는 개발자 | 계획 → 코딩 → 테스트 → 커밋을 에이전트와 함께 |
| `startup-mvp` | 빠른 프로토타입이 필요한 팀 | 스펙 → 구현 → 배포 최단 경로 |
| `legacy-onboarding` | 오래된 코드베이스 합류 | 에이전트로 구조 파악 → 코드 맵 생성 |
| `ai-pair-programming` | 주니어/미드 개발자 | 에이전트를 시니어처럼 활용하는 패턴 |
| `multi-agent-orch` | 복잡한 대형 태스크 | 여러 에이전트에게 역할 분배 후 결과 통합 |

---

### 📚 References

읽어볼 가치 있는 자료 큐레이션. 링크만 나열하지 않고, **왜 읽어야 하는지** 한 줄 설명 포함.

- 논문 · 연구 자료
- 주목할 GitHub 레포 (with star 기준 및 실용성 코멘트)
- 블로그 · 튜토리얼 (검증된 것만)
- 프롬프트 엔지니어링 컬렉션

---

## ⭐ 수록 기준

모든 콘텐츠는 아래 기준을 만족해야 합니다:

| 기준 | 설명 |
|------|------|
| ✅ 실사용 검증 | 실제로 사용해봤거나, 커뮤니티에서 반복 검증된 것 |
| ✅ 실무 적용 가능 | 장난감 예제가 아닌 실제 코드베이스에 적용 가능 |
| ✅ 반복 사용성 | 한 번만 쓰고 마는 것이 아닌, 루틴으로 쓸 수 있는 것 |
| ✅ setup 대비 효율 | 설치/설정 비용보다 얻는 생산성이 명확히 큰 것 |
| ✅ 한계 보완 | Codex/Claude Code의 알려진 약점을 보완하는 것 |

---

## 🛠 빠른 시작

```bash
# 레포 클론
git clone https://github.com/your-username/codex-arsenal.git
cd codex-arsenal

# 설정 파일 적용 (예시: VSCode 설정)
cp configs/vscode/settings.json ~/.vscode/settings.json

# 워크플로 스크립트 실행 (예시: solo-dev-loop)
./workflows/solo-dev-loop/setup.sh
```

> 각 폴더에는 독립적인 `README.md`가 있어 개별 설치 및 사용법을 안내합니다.

---

## 🤝 기여 방법

좋은 자료가 있다면 PR로 기여해주세요. 특히 환영하는 기여:

- 실제로 오래 써서 검증된 것
- before / after 생산성 차이가 명확한 것
- setup 과정이 step-by-step으로 정리된 것
- 특정 상황(레거시, 대형 레포, 팀 협업 등)에서 효과적인 것

**기여 절차:**

1. `fork` → feature 브랜치 생성 (`feat/plugin-이름` 또는 `feat/workflow-이름`)
2. 해당 카테고리 폴더에 파일 추가 (각 폴더의 `TEMPLATE.md` 참고)
3. PR 제목에 카테고리 명시: `[plugin] context-window-compressor 추가`
4. PR 본문에 **사용 배경 / 실제 효과 / 주의사항** 포함

---

## 🌌 방향성

가까운 미래의 개발 환경은 "IDE + 자동완성 AI" 수준을 넘어,  
개발자가 **여러 AI 에이전트를 orchestration하며 일하는 구조**에 가까워질 것입니다.

이 레포는 그 방향으로의 전환을 실험하고,  
실제로 쓸 수 있는 도구와 패턴을 기록하는 공간입니다.

---

## 📌 태그

`codex` `claude-code` `ai-agent` `developer-tools` `prompt-engineering`  
`llm-workflow` `productivity` `automation` `vscode` `terminal`