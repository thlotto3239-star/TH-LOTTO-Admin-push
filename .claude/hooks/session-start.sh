#!/bin/bash
# TH LOTTO — Session Start Hook
# บังคับให้ AI อ่านเอกสารโปรเจคก่อนทำงานทุกครั้ง

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "============================================================"
echo "  TH LOTTO ADMIN — SESSION START"
echo "  วันที่: $(date '+%Y-%m-%d %H:%M') (Bangkok: $(TZ=Asia/Bangkok date '+%Y-%m-%d %H:%M'))"
echo "============================================================"
echo ""

# 1. Git state ล่าสุด
echo "=== GIT STATE (5 commits ล่าสุด) ==="
git -C "$PROJECT_DIR" log --oneline -5
echo ""

# 2. CLAUDE.md ทั้งหมด — Single Source of Truth
echo "=== CLAUDE.md — อ่านก่อนทำงาน ==="
cat "$PROJECT_DIR/CLAUDE.md"
echo ""

# 3. CHANGELOG ล่าสุด (40 บรรทัดแรก = เวอร์ชันล่าสุด)
echo "=== CHANGELOG — เวอร์ชันล่าสุด ==="
head -45 "$PROJECT_DIR/CHANGELOG.md"
echo ""

# 4. สรุปสถานะ
echo "============================================================"
echo "  อ่านเอกสารครบแล้ว — พร้อมทำงาน"
echo "  Admin URL: https://th-lotto-admin-five.vercel.app"
echo "  User App : https://th-lotto-app.vercel.app"
echo "  Supabase : ygopnjbvccenryejqmlw (Tokyo)"
echo "  Branch   : master (Admin) | main (User App)"
echo "============================================================"

# 5. ติดตั้ง dependencies (ถ้าจำเป็น)
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo ""
    echo "=== ติดตั้ง dependencies ==="
    cd "$PROJECT_DIR" && npm install
    echo "npm install เสร็จแล้ว"
  fi
fi
