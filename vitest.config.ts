import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        branches: 100, // 分岐 100%（除外後）
        statements: 100, // 命令 100%（除外後）
        lines: 100, // 行 100%（除外後）
        functions: 100, // 関数: 100%（除外後）
      },
      // 除外対象: 自動生成型・style ファイル・フレームワーク接着層・設計参照ファイル
      // 各除外には理由を明記する（frontend-00-stack.md §カバレッジ閾値ルール準拠）
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/**",
        "claude-poc-docs/**", // 設計参照ドキュメント（テスト対象外）
        "src/test/**", // テスト共通設定（テスト対象外）
        "src/styles/**", // CSS ファイル（テスト対象外）
        "src/app/layout.tsx", // Next.js フレームワーク接着層（サーバーコンポーネント）
        "src/app/page.tsx", // Next.js redirect のみ（フレームワーク接着層）
        "src/app/**/layout.tsx", // Next.js フレームワーク接着層（括弧なしパスのみ有効）
        "src/app/\\(protected\\)/**/layout.tsx", // Next.js フレームワーク接着層（protected ルート）
        "src/app/\\(public\\)/**/layout.tsx", // Next.js フレームワーク接着層（public ルート）
        "src/app/forbidden/page.tsx", // 静的ページ（表示のみ・ロジックなし）
        // ※ micromatch では (protected)・(public) の括弧が extglob として解釈されるため
        //    \\( \\) でエスケープして literal match させる
        "src/app/\\(public\\)/login/page.tsx", // Next.js サーバーコンポーネント接着層（LoginForm へ委譲のみ）
        "src/app/\\(public\\)/password-reset/page.tsx", // Next.js サーバーコンポーネント接着層（PasswordResetRequestForm へ委譲のみ）
        "src/app/\\(public\\)/register/page.tsx", // Next.js サーバーコンポーネント接着層（RegisterForm へ委譲のみ）
        "src/app/\\(protected\\)/notifications/page.tsx", // Next.js サーバーコンポーネント接着層（NotificationList へ委譲のみ・SCR-010）
        "src/app/\\(public\\)/support/page.tsx", // Next.js サーバーコンポーネント接着層（SupportInfo へ委譲のみ・SCR-011）
        "src/app/\\(protected\\)/carrier/dashboard/page.tsx", // Next.js サーバーコンポーネント接着層（CarrierDashboard へ委譲のみ）
        "src/app/\\(protected\\)/carrier/applications/page.tsx", // Next.js サーバーコンポーネント接着層（CarrierApplicationList へ委譲のみ・SCR-202）
        "src/app/\\(protected\\)/carrier/history/page.tsx", // Next.js サーバーコンポーネント接着層（ApplicationHistory へ委譲のみ・SCR-206）
        "src/app/\\(protected\\)/carrier/jobs/**/page.tsx", // Next.js サーバーコンポーネント接着層（DeliveryReport へ委譲のみ・SCR-205・[jobId] ルート）
        "src/app/\\(protected\\)/carrier/jobs/**/page.tsx", // Next.js サーバーコンポーネント接着層（連絡機能 MessageThread へ委譲のみ・SCR-204-01・[jobId] ルート）
        "src/app/\\(protected\\)/carrier/jobs/**/page.tsx", // Next.js サーバーコンポーネント接着層（CarrierJobDetail へ委譲のみ・SCR-204・[jobId] ルート）
        "src/app/\\(protected\\)/carrier/jobs/page.tsx", // Next.js サーバーコンポーネント接着層（JobSearchList へ委譲のみ・SCR-201）
        "src/app/\\(protected\\)/shipper/dashboard/page.tsx", // Next.js サーバーコンポーネント接着層（ShipperDashboard へ委譲のみ）
        "src/app/\\(protected\\)/shipper/jobs/new/page.tsx", // Next.js サーバーコンポーネント接着層（JobCreateForm へ委譲のみ）
        "src/app/\\(protected\\)/shipper/jobs/page.tsx", // Next.js サーバーコンポーネント接着層（JobList へ委譲のみ）
        "src/app/\\(protected\\)/shipper/jobs/**/page.tsx", // Next.js サーバーコンポーネント接着層（JobDetail・Completion へ委譲のみ・[jobId] ルートを含む）
        "src/app/\\(protected\\)/shipper/history/page.tsx", // Next.js サーバーコンポーネント接着層（JobHistory へ委譲のみ・SCR-106）
        "src/mocks/**", // 開発環境専用 MSW モック（テスト対象外）
        "src/features/auth/types/auth.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/message/types/message.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/notifications/types/notification-list.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/dashboard/types/dashboard.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/applications/types/application-list.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/application-history/types/application-history.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/delivery-report/types/delivery-report.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/job-detail/types/carrier-job-detail.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/set-application/types/set-application.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/carrier/job-search/types/job-search.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/dashboard/types/dashboard.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/job-create/types/job-create.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/job-list/types/job-list.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/job-history/types/job-history.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/job-detail/types/job-detail.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/features/shipper/job-completion/types/job-completion.types.ts", // TypeScript 型定義のみ（実行コードなし・カバレッジ計測対象外）
        "src/app/api/**", // Route Handler（Next.js サーバーランタイム依存）
        "src/middleware.ts", // Next.js middleware（サーバーランタイム依存）
        "src/lib/server/**", // Next.js サーバーランタイム依存（next/headers の cookies()）。jsdom テスト環境では実行不可
        "src/features/auth/components/AuthProvider.tsx", // Next.js layout.tsx との接着層。useEffect で store 初期化するのみで業務ロジックなし
        "**/*.config.ts", // 設定ファイル
        "**/*.config.js",
        "**/*.config.mjs",
        "vitest.config.ts",
        "next.config.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
