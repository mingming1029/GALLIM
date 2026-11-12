# 갈림

KORAS-G 문항으로 재범 위험성 평가를 연습하는 시제품입니다. 사례는 모두 가상입니다. 실제 대상자의 판단에 쓰는 도구가 아닙니다.

## 실행

의존성을 설치한 뒤 개발 서버를 켭니다.

```bash
npm install
npm run dev
```

Windows PowerShell에서는 `npm` 대신 `npm.cmd`를 씁니다.

```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 http://localhost:3000 을 엽니다. Supabase 주소와 키를 넣기 전에는 목록 대신 설정 안내가 나옵니다.

## 화면

- `/` 가상 사례 목록. 들어올 때마다 순서가 바뀝니다
- `/cases/[id]` 사건기록
- `/cases/[id]/record` 17문항 채점, AI 채점과 비교, 최종 판단
- `/analysis` 갈림 분석
- `/about` 연습 범위, 출처, 한계, 데이터 처리

## Supabase

앱은 시작할 때 익명으로 한 번 로그인합니다. 판단 기록은 그 방문자만 읽고 씁니다. 사례 본문은 데이터베이스에 없습니다. secret 키와 service role 키는 쓰지 않습니다.

1. https://supabase.com/dashboard 에서 프로젝트를 만듭니다. 데이터베이스 비밀번호를 정하고, 프로젝트가 준비될 때까지 기다립니다.
2. 왼쪽 **Authentication**을 연 다음 **Sign In / Providers**로 갑니다. **Anonymous**를 켜고 저장합니다.
3. 프로젝트 위쪽 **Connect**를 엽니다. 프레임워크로 Next.js를 고르면 Project URL과 publishable 키가 보입니다. 키는 `sb_publishable_`로 시작합니다.
4. 프로젝트 폴더에 `.env.local`을 만들고 그 두 값을 넣습니다. 변수 이름은 아래와 같습니다. publishable 키를 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 넣습니다. `sb_secret_`으로 시작하는 키는 넣지 않습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

5. 왼쪽 **SQL Editor**에서 **New query**를 누르고 `supabase/schema_v2.sql` 내용 전부를 붙여 넣은 뒤 **Run**을 누릅니다. 이 스크립트는 예전 `cases`, `records` 테이블과 그 데이터를 지우고 `judgments` 테이블을 만듭니다.
6. 개발 서버를 끄고 다시 켭니다. PowerShell에서는 `npm.cmd run dev`입니다. 환경변수는 서버를 다시 켜야 반영됩니다.

키 목록 전체를 보려면 Dashboard의 **Settings > API Keys**로 갑니다. Settings > API라는 별도 메뉴는 없습니다.

`.env.local`은 git에 올리지 않습니다. `.gitignore`가 `.env*`를 제외하고, 빈 이름만 있는 `.env.example`만 저장소에 있습니다.

## Vercel

코드를 GitHub에 올린 뒤 Vercel에서 그 저장소를 연결합니다. 환경변수는 로컬과 같은 두 개입니다. `NEXT_PUBLIC_` 값은 빌드할 때 클라이언트 코드에 들어가므로, 변수를 넣은 뒤 새로 배포해야 화면에 반영됩니다.

1. GitHub에서 새 저장소를 만듭니다. `.env.local`은 커밋하지 않습니다.
2. 이 폴더를 그 저장소에 push합니다.
3. https://vercel.com/dashboard 오른쪽 위의 **New Project**를 누릅니다. GitHub가 연결되어 있지 않으면 안내에 따라 계정을 연결합니다.
4. 방금 push한 저장소를 고릅니다. Framework Preset은 Next.js로 잡힙니다. Root Directory는 저장소 루트입니다.
5. **Environment Variables**에 아래 두 개를 넣습니다. 값은 `.env.local`과 같습니다. 종류는 Config로 두고, Production, Preview, Development를 모두 선택합니다. `sb_secret_` 키는 넣지 않습니다.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

6. **Deploy**를 누릅니다. 배포가 끝나면 화면에 나온 주소로 엽니다.
7. 변수를 빠뜨렸다면 프로젝트를 연 뒤 왼쪽 **Environment Variables**에서 같은 두 개를 넣고 Save합니다. 이미 만들어진 배포에는 적용되지 않으므로, Deployments에서 다시 배포합니다.

Supabase의 Anonymous와 `schema_v2.sql`은 배포 전에 끝나 있어야 합니다. Vercel에는 별도의 데이터베이스 비밀번호나 service role 키를 넣지 않습니다.
