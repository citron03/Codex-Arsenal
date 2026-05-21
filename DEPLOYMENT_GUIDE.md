# Codex-Arsenal 배포 시스템 설계 가이드

> 다른 프로젝트에서 codex-arsenal의 설정을 손쉽게 가져올 수 있도록 하는  
> 배포 시스템의 설계 방향과 구현 가이드.

---

## 1. 배포 방식 결정

### 선택지 비교

| 방식 | 장점 | 단점 | 권장 대상 |
|------|------|------|-----------|
| **npx CLI** | 설치 없이 바로 실행, 대화형 선택 가능 | Node.js 필요 | 대부분의 개발자 |
| **curl 단일 파일** | 의존성 없음, 가장 단순 | 선택 UI 불가 | 단일 파일 빠른 복사 |
| **git sparse-checkout** | 클론 없이 일부만 취득 | git 명령어 번거로움 | git에 익숙한 개발자 |
| **npm 패키지 설치** | 로컬 캐시, 오프라인 사용 | 전역 설치 필요 | 반복 사용자 |

### 권장 구조

세 방식을 모두 지원하되, **npx CLI를 주 진입점**으로 삼는다.  
curl은 단일 파일 빠른 복사용 보조 수단으로 README에 병기한다.

---

## 2. 레포지토리 구조 설계

배포 시스템을 위해 레포에 다음 구조를 추가한다.

```
codex-arsenal/
├── package.json          ← npm 패키지 루트 (bin 진입점 등록)
├── .npmignore            ← npm 배포 시 제외할 파일 목록
│
├── bin/
│   └── cli.js            ← npx 진입점 (shebang 포함)
│
├── lib/
│   ├── manifest.js       ← 설치 가능한 항목 전체 목록 (단일 소스)
│   ├── selector.js       ← 터미널 대화형 선택 UI
│   ├── installer.js      ← 파일 복사/다운로드 로직
│   └── fetcher.js        ← GitHub raw URL 다운로드
│
└── (기존 폴더들)
    ├── CODEX.md
    ├── configs/
    ├── skills/
    └── workflows/
```

**핵심 원칙:** `lib/manifest.js`가 단일 소스 오브 트루스.  
새 항목을 추가할 때 manifest만 수정하면 CLI, 문서, curl 경로가 모두 자동으로 일치한다.

---

## 3. manifest.js 설계

설치 가능한 모든 항목을 정의하는 중심 파일이다.

```js
// lib/manifest.js

const REPO = "your-username/codex-arsenal";
const BRANCH = "main";
export const BASE_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

export const MANIFEST = [
  // ── Behavior Guidelines ───────────────────────────────────────────
  {
    id: "codex-md",
    category: "Behavior Guidelines",
    label: "CODEX.md",
    description: "Codex 에이전트 행동 가이드라인 (모든 프로젝트 권장)",
    files: [
      { src: "CODEX.md", dest: "CODEX.md" },
    ],
    default: true,   // init 시 기본 선택
  },
  {
    id: "claude-md",
    category: "Behavior Guidelines",
    label: "CLAUDE.md",
    description: "Claude Code 행동 가이드라인",
    files: [
      { src: "CLAUDE.md", dest: "CLAUDE.md" },
    ],
  },

  // ── Configs ───────────────────────────────────────────────────────
  {
    id: "config-codex",
    category: "Configs",
    label: ".codex/config.json",
    description: "Codex 에이전트 기본 설정 프리셋",
    files: [
      { src: "configs/codex/config.json", dest: ".codex/config.json" },
    ],
  },
  {
    id: "config-vscode",
    category: "Configs",
    label: ".vscode/settings.json",
    description: "VSCode + Codex 통합 설정",
    files: [
      { src: "configs/vscode/settings.json", dest: ".vscode/settings.json" },
    ],
  },
  {
    id: "prompt-solo",
    category: "Configs",
    label: "system-prompt: solo-dev",
    description: "혼자 개발할 때 쓰는 system prompt",
    files: [
      { src: "configs/system-prompts/solo-dev.md", dest: "configs/system-prompts/solo-dev.md" },
    ],
  },

  // ── Skills ────────────────────────────────────────────────────────
  {
    id: "skill-debug",
    category: "Skills",
    label: "debug-workflow",
    description: "에러 → 분석 → 수정 → 테스트 파이프라인",
    files: [
      { src: "skills/debug-workflow/README.md",    dest: "skills/debug-workflow/README.md" },
      { src: "skills/debug-workflow/prompt.md",    dest: "skills/debug-workflow/prompt.md" },
      { src: "skills/debug-workflow/workflow.json", dest: "skills/debug-workflow/workflow.json" },
    ],
  },
  {
    id: "skill-test-gen",
    category: "Skills",
    label: "test-gen",
    description: "함수 시그니처로 유닛 테스트 자동 생성",
    files: [
      { src: "skills/test-gen/README.md", dest: "skills/test-gen/README.md" },
      { src: "skills/test-gen/prompt.md", dest: "skills/test-gen/prompt.md" },
    ],
  },

  // ── Workflows ─────────────────────────────────────────────────────
  {
    id: "workflow-solo",
    category: "Workflows",
    label: "solo-dev-loop",
    description: "계획 → 코딩 → 테스트 → 커밋을 에이전트와 함께",
    files: [
      { src: "workflows/solo-dev-loop/README.md", dest: "workflows/solo-dev-loop/README.md" },
      { src: "workflows/solo-dev-loop/setup.sh",  dest: "workflows/solo-dev-loop/setup.sh" },
    ],
  },
];
```

**설계 포인트:**
- `files` 배열로 항목 하나가 여러 파일을 포함할 수 있음
- `dest`를 명시해서 설치 위치를 제어함
- `default: true`로 `init` 시 기본 선택 항목을 지정

---

## 4. CLI 설계

### 4-1. 진입점 (`bin/cli.js`)

```js
#!/usr/bin/env node
// bin/cli.js

import { Command } from "commander";
import { runInit } from "../lib/installer.js";
import { MANIFEST } from "../lib/manifest.js";

const program = new Command();

program
  .name("codex-arsenal")
  .description("codex-arsenal 설정을 현재 프로젝트에 선택 설치")
  .version("0.1.0");

program
  .command("init")
  .description("대화형 선택 설치 (기본 명령)")
  .option("-y, --yes", "모든 default 항목을 확인 없이 설치")
  .option("-d, --dir <path>", "설치 대상 디렉토리", process.cwd())
  .action(runInit);

program
  .command("list")
  .description("설치 가능한 항목 목록 출력")
  .action(() => {
    let lastCategory = "";
    for (const item of MANIFEST) {
      if (item.category !== lastCategory) {
        console.log(`\n\x1b[36m${item.category}\x1b[0m`);
        lastCategory = item.category;
      }
      console.log(`  ${item.id.padEnd(22)} ${item.description}`);
    }
    console.log();
  });

program
  .command("get <id...>")
  .description("특정 항목만 설치. 여러 개 가능: get codex-md skill-debug")
  .option("-d, --dir <path>", "설치 대상 디렉토리", process.cwd())
  .action(async (ids, opts) => {
    const items = ids.map((id) => {
      const found = MANIFEST.find((m) => m.id === id);
      if (!found) { console.error(`알 수 없는 항목: ${id}`); process.exit(1); }
      return found;
    });
    await runInit({ preSelected: items, dir: opts.dir, skipPrompt: true });
  });

// 인수 없이 실행하면 init 실행
if (process.argv.length === 2) process.argv.push("init");

program.parse();
```

### 4-2. 대화형 선택 UI (`lib/selector.js`)

UI 라이브러리로 **`@inquirer/prompts`**를 사용한다.  
`inquirer`의 공식 경량 후속 패키지로, 추가 의존성 없이 체크박스 UI를 구현한다.

```js
// lib/selector.js
import { checkbox } from "@inquirer/prompts";
import { MANIFEST } from "./manifest.js";

export async function selectItems(preSelected = null) {
  // 카테고리별로 그룹핑
  const grouped = MANIFEST.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const choices = [];
  for (const [category, items] of Object.entries(grouped)) {
    choices.push({ type: "separator", separator: `── ${category} ` });
    for (const item of items) {
      choices.push({
        name: `${item.label.padEnd(26)} ${item.description}`,
        value: item,
        checked: preSelected
          ? preSelected.some((p) => p.id === item.id)
          : !!item.default,
      });
    }
  }

  return checkbox({
    message: "설치할 항목을 선택하세요 (스페이스바 선택, 엔터 확인)",
    choices,
    pageSize: 20,
  });
}
```

### 4-3. 설치 로직 (`lib/installer.js`)

```js
// lib/installer.js
import fs from "fs";
import path from "path";
import { input } from "@inquirer/prompts";
import { selectItems } from "./selector.js";
import { fetchFile } from "./fetcher.js";
import { BASE_URL } from "./manifest.js";

export async function runInit(opts = {}) {
  const { preSelected, skipPrompt, yes } = opts;

  // 1. 항목 선택
  const selected = skipPrompt
    ? preSelected
    : await selectItems(preSelected);

  if (!selected || selected.length === 0) {
    console.log("아무것도 선택하지 않았습니다.");
    return;
  }

  // 2. 설치 경로 확인
  let targetDir = opts.dir || process.cwd();
  if (!skipPrompt && !yes) {
    targetDir = await input({
      message: "설치 위치",
      default: process.cwd(),
    });
  }
  targetDir = path.resolve(targetDir);

  // 3. 파일 설치
  console.log(`\n설치 시작 → ${targetDir}\n`);
  let ok = 0, fail = 0;

  for (const item of selected) {
    for (const file of item.files) {
      const url = `${BASE_URL}/${file.src}`;
      const dest = path.join(targetDir, file.dest);
      try {
        const content = await fetchFile(url);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content, "utf8");
        console.log(`  ✔ ${file.dest}`);
        ok++;
      } catch (e) {
        console.log(`  ✘ ${file.dest}  (${e.message})`);
        fail++;
      }
    }
  }

  console.log(`\n완료: ${ok}개 설치${fail > 0 ? `, ${fail}개 실패` : ""}`);
}
```

### 4-4. 파일 다운로드 (`lib/fetcher.js`)

```js
// lib/fetcher.js
import https from "https";

export function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // 리다이렉트 처리
      if ([301, 302, 307].includes(res.statusCode)) {
        return fetchFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}
```

---

## 5. package.json 설계

```json
{
  "name": "codex-arsenal",
  "version": "0.1.0",
  "description": "AI 코딩 에이전트 설정·스킬·워크플로 선택 설치 CLI",
  "type": "module",
  "bin": {
    "codex-arsenal": "./bin/cli.js"
  },
  "files": [
    "bin/",
    "lib/",
    "CODEX.md",
    "CLAUDE.md",
    "configs/",
    "skills/",
    "workflows/"
  ],
  "dependencies": {
    "@inquirer/prompts": "^7.0.0",
    "commander": "^12.0.0"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": ["codex", "claude-code", "ai-agent", "developer-tools"],
  "license": "MIT"
}
```

**`files` 배열 중요:** npm에 올라가는 파일을 명시적으로 제한한다.  
`examples/`, `references/`, `.github/` 등 불필요한 폴더가 패키지에 포함되지 않게 한다.

---

## 6. npm 배포 절차

### 6-1. 최초 배포

```bash
# 1. npm 계정 로그인
npm login

# 2. 패키지 이름 중복 확인
npm info codex-arsenal

# 3. 배포 전 포함 파일 확인 (dry-run)
npm pack --dry-run

# 4. 배포
npm publish --access public
```

`--access public`은 스코프 없는 패키지에는 필요 없지만,  
`@username/codex-arsenal` 형태의 스코프 패키지라면 반드시 붙여야 한다.

### 6-2. 버전 업데이트 및 재배포

[Semantic Versioning](https://semver.org/) 기준:

| 변경 종류 | 명령 | 예시 |
|-----------|------|------|
| 새 항목 추가, 비파괴적 변경 | `npm version minor` | 0.1.0 → 0.2.0 |
| 버그 수정, 파일 내용 업데이트 | `npm version patch` | 0.1.0 → 0.1.1 |
| CLI 인터페이스 구조 변경 | `npm version major` | 0.1.0 → 1.0.0 |

```bash
# 버전 올리고 배포
npm version patch   # 또는 minor, major
npm publish
```

`npm version` 명령은 package.json 수정 + git tag 생성을 자동으로 해준다.

### 6-3. GitHub Actions로 자동 배포

`main` 브랜치에 태그가 push되면 자동으로 npm에 배포되도록 설정한다.

```yaml
# .github/workflows/publish.yml

name: Publish to npm

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      - run: npm ci

      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**NPM_TOKEN 발급:**
1. `npmjs.com` → 프로필 → Access Tokens → Generate New Token
2. 타입: **Automation** (CI/CD 전용, 2FA 우회 가능)
3. GitHub 레포 → Settings → Secrets → `NPM_TOKEN`으로 등록

배포 흐름:
```
코드 수정 → npm version patch → git push --follow-tags → Actions 자동 배포
```

---

## 7. .npmignore 설정

```
# 개발/문서 파일 — npm 패키지에 불필요
.github/
examples/
references/
*.test.js
.eslintrc*
```

`.npmignore`가 없으면 `.gitignore`를 대신 사용한다.  
`package.json`의 `files` 필드가 더 명확하므로, 가능하면 `files`로 관리하는 것이 낫다.

---

## 8. 사용자 경험 설계

### CLI 사용 흐름

```
# 가장 빠른 시작
npx codex-arsenal

# 특정 항목만
npx codx-arsenal get codex-md skill-debug

# 설치 가능 목록 확인
npx codex-arsenal list

# 전역 설치 후 반복 사용
npm install -g codex-arsenal
codex-arsenal init
```

### curl 경로도 병행 제공

CLI가 번거로운 사용자를 위해 README에 raw URL도 함께 안내한다.

```bash
# CODEX.md 하나만 빠르게
curl -sO https://raw.githubusercontent.com/your-username/codex-arsenal/main/CODEX.md
```

파일 경로가 manifest와 일치하면, manifest에서 curl 경로를 자동 생성하는 스크립트도 만들 수 있다.

---

## 9. 새 항목 추가 시 기여 가이드

1. 해당 카테고리 폴더에 파일 추가 (`skills/my-skill/README.md` 등)
2. `lib/manifest.js`에 항목 등록
3. `npm version patch` 후 PR

manifest를 단일 소스로 유지하면, 문서 업데이트 누락이나 URL 불일치를 방지할 수 있다.

---

## 10. 구현 우선순위 제안

단계적으로 구현한다. 각 단계가 독립적으로 유용하다.

| 단계 | 작업 | 효과 |
|------|------|------|
| **1단계** | manifest.js 작성 + README에 curl 경로 추가 | 당장 쓸 수 있는 배포 |
| **2단계** | bin/cli.js + lib/ 구현 + npm publish | `npx codex-arsenal` 사용 가능 |
| **3단계** | GitHub Actions 자동 배포 설정 | 릴리스 자동화 |
| **4단계** | `--yes` 플래그, 설치 이력 저장 등 편의 기능 추가 | UX 개선 |