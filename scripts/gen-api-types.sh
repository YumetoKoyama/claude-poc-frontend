#!/usr/bin/env bash
# OpenAPI YAML から TypeScript 型定義を生成する。
# YAML にパースエラーがあるファイルはスキップし、警告を出して続行する。
# 使い方: npm run gen:types

set -euo pipefail

YAML_DIR="../claude-poc-docs/docs/design/api"
OUT_DIR="src/lib/api/generated"

mkdir -p "$OUT_DIR"

failed=()
succeeded=()

for yaml in "$YAML_DIR"/*.yaml; do
  name=$(basename "$yaml" .yaml)
  out="${OUT_DIR}/${name}.d.ts"

  if npx openapi-typescript "$yaml" --output "$out" 2>/tmp/ots-err; then
    succeeded+=("$name")
  else
    echo "⚠️  SKIP: ${name}.yaml — $(head -1 /tmp/ots-err)"
    failed+=("$name")
    # 壊れた出力ファイルが残らないよう削除
    rm -f "$out"
  fi
done

echo ""
echo "✅ 生成成功 (${#succeeded[@]}): ${succeeded[*]}"

if [ ${#failed[@]} -gt 0 ]; then
  echo "❌ スキップ  (${#failed[@]}): ${failed[*]}"
  echo "   → YAMLのパースエラーを修正後に再実行してください"
  exit 1
fi
