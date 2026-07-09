/**
 * PostCSS 設定（Tailwind CSS v4）
 *
 * Tailwind v4 では @tailwindcss/postcss プラグインで
 * src/styles/globals.css の `@import "tailwindcss";` をユーティリティ CSS に変換する。
 * この設定が無いと Tailwind クラスが一切生成されず、スタイル未適用の素の HTML になる。
 */
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
