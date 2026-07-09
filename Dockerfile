# 依存・ビルドステージ（Node 24 / standalone 出力）
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# クライアントへ埋め込む API ベース URL（ビルド時に確定）
# 手順3-(3b): 同一オリジン構成。ブラウザのデータ取得は :80 と同一オリジンで /api/* を叩く
# （ALB の :80 で /api/* は BE へ転送）。そのため空（相対パス＝same-origin）でビルドする。
# ※ ブラウザのネットワークが :8080 を遮断するため別オリジン(8080直叩き)は不可。:8080 は
#   FE タスク→BE のログイン中継(サーバー側/NAT 経由)専用として ALB に残す。
# 別環境では `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=...` で上書き可能。
ARG NEXT_PUBLIC_API_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# 手順3-(3a): dev は HTTPS を使わないため、ログイン/ログアウトの Cookie の secure 属性を
# ビルド時に false へ書き換える（HTTP でも Cookie が送られるようにする dev 限定の回避策）。
# 本番では HTTPS を導入し、この sed 行を削除して secure を有効に戻すこと。
RUN sed -i 's/secure: process.env.NODE_ENV === "production"/secure: false/g' \
      src/app/api/auth/login/route.ts \
      src/app/api/auth/logout/route.ts
RUN npm run build

# 実行ステージ（standalone）
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]