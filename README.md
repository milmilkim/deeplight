# DeepLight

**DeepLight**는 LLM(Large Language Model)과 DeepL API를 활용한 웹 기반 번역 애플리케이션입니다.
단순한 텍스트 변환을 넘어, 시스템 프롬프트를 통해 번역의 어조와 스타일을 제어할 수 있는 맞춤형 번역 경험을 제공합니다.

## 🔗 배포 (Demo)

[https://deeplight.vercel.app](https://deeplight.vercel.app)

> _개인 API Key가 필요하며, 입력한 키와 번역 데이터는 서버에 저장되지 않고 로컬 브라우저에만 저장됩니다._

## 🛠️ 주요 기능

- **AI 번역 (LLM Mode)**

  - OpenAI, Google (Gemini) 모델 지원
  - Custom API 연동 지원
  - 시스템 프롬프트(Prompt Fragments)를 조합하여 원하는 번역 스타일 적용

- **DeepL 연동**

  - 기존 DeepL API를 활용한 모드 지원

- **사용자 경험 (UX)**
  - 다크 모드 지원
  - 번역 히스토리 관리 (Local Storage 기반)
  - 직관적인 모바일/데스크탑 반응형 UI

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Server State**: TanStack Query

## 🚀 실행 방법

git clone 후, 의존성을 설치하고 개발 서버를 실행합니다.

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.
