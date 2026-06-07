#!/bin/bash
# TH LOTTO — Session Start Hook (Optimized)
# แสดงข้อมูลสำคัญแบบกระชับ + สั่งให้ AI อ่าน CLAUDE.md เต็มก่อนทำงาน

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "================================================================"
echo "  TH LOTTO ADMIN — SESSION START"
echo "  Bangkok: $(TZ=Asia/Bangkok date '+%Y-%m-%d %H:%M')"
echo "================================================================"
echo ""

echo "=== GIT STATE ==="
git -C "$PROJECT_DIR" log --oneline -6
echo ""

echo "=== PROJECT INFO ==="
echo "  Admin URL : https://th-lotto-admin-five.vercel.app"
echo "  User App  : https://th-lotto-app.vercel.app"
echo "  Supabase  : ygopnjbvccenryejqmlw (Tokyo)"
echo "  Branch    : master (Admin) | main (User App)"
echo "  Deploy    : git push → GitHub → Vercel auto-deploy (ไม่ต้องรัน CLI)"
echo ""

echo "=== กฎเหล็ก (ห้ามละเมิด) ==="
echo "  1. ห้ามบอกว่าเสร็จถ้ายังไม่ verify จาก git/DB จริง"
echo "  2. อ่านไฟล์จริงก่อนแก้โค้ดทุกครั้ง ห้ามเขียนจากความจำ"
echo "  3. หลังแก้เสร็จ → อัปเดต CLAUDE.md + CHANGELOG.md + PROJECT_STATUS.md"
echo "  4. bet_type หวยหลัก = UPPERCASE | หวย1นาที = lowercase"
echo "  5. instant_bets status = PENDING/WIN/LOSE (ไม่ใช่ WON/LOST)"
echo "  6. pin bet amount = ราคาต่อตัว × picks (ไม่ใช่ amt เดี่ยว)"
echo "  7. draw_id หวย1นาที = BIGINT (ไม่ใช่ UUID)"
echo "  8. ห้ามเก็บ token/password ในไฟล์ใดๆ"
echo ""

echo "=== CHANGELOG ล่าสุด ==="
head -25 "$PROJECT_DIR/CHANGELOG.md"
echo ""

echo "================================================================"
echo "  ACTION REQUIRED: อ่าน CLAUDE.md ทั้งหมดก่อนทำงาน"
echo "  คำสั่ง: Read /home/user/TH-LOTTO-Admin-push/CLAUDE.md"
echo "================================================================"

# ติดตั้ง dependencies ถ้าจำเป็น (remote env เท่านั้น)
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo ""
  echo "=== Installing dependencies ==="
  cd "$PROJECT_DIR" && npm install --silent
  echo "npm install done"
fi
