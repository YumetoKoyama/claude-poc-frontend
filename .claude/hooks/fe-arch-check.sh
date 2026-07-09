#!/usr/bin/env bash
# .claude/hooks/fe-arch-check.sh
#
# 役割:
#   Claude Code の PreToolUse フック（Skill: review-implementation 前）。
#   フロントエンドアーキテクチャの機械的チェックを実行し、結果を
#   additionalContext としてモデルのコンテキストへ注入する。
#
#   チェック観点:
#     3a: src/lib/api/generated/ の存在確認（型生成未実施の検出）
#     3b: 全サービスファイルの createApiClient<paths>() 使用確認
#
# 入出力:
#   stdin  : Claude Code が渡す PreToolUse の JSON（本スクリプトでは未使用）
#   stdout : hookSpecificOutput.additionalContext を含む JSON
#
# 依存: bash + node（プロジェクトに node が存在すること）

set -u

cd "$CLAUDE_PROJECT_DIR"

node -e "
const fs = require('fs');
const { execSync } = require('child_process');
const findings = [];

// src/ 配下の差分を確認（差分がなければチェック不要）
let feDiff = [];
try {
  feDiff = execSync('git diff --name-only main...HEAD', { encoding: 'utf8' })
    .split('\n')
    .filter(f => f.startsWith('src/'));
} catch (e) {}

if (feDiff.length > 0) {

  // 3a: 型生成ディレクトリ存在チェック
  if (!fs.existsSync('src/lib/api/generated')) {
    findings.push(
      '[BLOCK/architecture/3a] src/lib/api/generated/ が存在しない。' +
      'npm run gen:types 未実行または生成物未コミット。'
    );
  }

  // 3b: 全サービスファイルの createApiClient 使用チェック
  let svcs = [];
  try {
    svcs = execSync(
      'find src/features -name \"*.service.ts\" ! -name \"*.test.ts\"',
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);
  } catch (e) {}

  for (const f of svcs) {
    try {
      if (!fs.readFileSync(f, 'utf8').includes('createApiClient')) {
        findings.push(
          '[BLOCK/architecture/3b] ' + f +
          ' が createApiClient<paths>() 未使用（生fetch/apiRequest等を使用）'
        );
      }
    } catch (e) {}
  }
}

const msg = findings.length > 0
  ? '【FEアーキテクチャ機械チェック - BLOCKあり - 必ずfindings JSONに含めること】\n' +
    findings.join('\n')
  : '【FEアーキテクチャ機械チェック - 問題なし】' +
    'src/lib/api/generated/ 存在確認済み・全サービスファイル createApiClient 使用確認済み';

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    additionalContext: msg
  }
}));
"
