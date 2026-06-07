# PROJECT STATUS - TH-LOTTO Admin Panel

## Current State

### Version
- **Current Version**: v1.3.4 (2026-06-07)
- **Previous Version**: v1.3.3 (2026-06-06)

### Project Information
- **GitHub Admin:** https://github.com/thlotto3239-star/TH-LOTTO-Admin-push (branch: master)
- **GitHub User App:** https://github.com/thlotto3239-star/thlotto-premium (branch: main)
- **Admin URL:** https://th-lotto-admin-five.vercel.app
- **User App URL:** https://th-lotto-app.vercel.app
- **Supabase:** ygopnjbvccenryejqmlw (Tokyo)

> ⚠️ `th-lotto-admin.vercel.app` = project เก่า ไม่ auto-deploy แล้ว ห้ามใช้

### Admin Panel Features (26 หน้า)
- ✅ Dashboard - ภาพรวมระบบ + feed + กราฟ 7 วัน
- ✅ Members - จัดการสมาชิก + ปรับยอดกระเป๋า
- ✅ MemberDetail - ดูข้อมูลสมาชิกทั้งหมด
- ✅ Deposits - รายการฝากเงิน + ดูสลิป + Export CSV
- ✅ Withdrawals - รายการถอนเงิน + Export CSV
- ✅ Affiliates - ระบบแนะนำเพื่อน
- ✅ Lottery Markets - จัดการตลาดหวย 21 ตลาด
- ✅ Results - ออกผลรางวัล (Staging Pattern)
- ✅ Bets List - รายการโพยหวยหลัก
- ✅ Restricted Numbers - เลขอั้น
- ✅ Wheel Admin - วงล้อโชคดี + Banner
- ✅ Settings - ตั้งค่าระบบ (Tracking, Popup, ขีดจำกัด)
- ✅ Appearance - รูปลักษณ์ + iPhone 15 iframe preview
- ✅ Sliders - สไลเดอร์
- ✅ Promotions - โปรโมชั่น + allowed_game
- ✅ Articles - บทความ
- ✅ FeedManagement - จัดการฟีด (read-only)
- ✅ Banks - ธนาคาร
- ✅ Admins - ผู้ดูแลระบบ + 15 permissions
- ✅ Data Management - Backup & ล้างข้อมูลเก่า
- ✅ InstantOverview - ภาพรวมหวยหนึ่งนาที (auto-refresh 30s)
- ✅ InstantBetTypes - จัดการประเภทเดิมพัน 9 ประเภท
- ✅ InstantDraws - จัดการงวดออกรางวัล
- ✅ InstantBets - รายการแทงหวย 1 นาที
- ✅ InstantSettings - ตั้งค่าหวย 1 นาที
- ✅ InstantResults - ผลรางวัลหวย 1 นาที

### Admin RPCs (21 ตัว)
- ✅ admin_dashboard_stats / admin_dashboard_advanced_stats
- ✅ admin_approve_deposit / admin_reject_deposit
- ✅ admin_approve_withdrawal / admin_reject_withdrawal
- ✅ admin_update_member / admin_adjust_wallet
- ✅ admin_set_result_and_settle
- ✅ admin_add_restricted_number / admin_remove_restricted_number
- ✅ admin_get_wheel_config / admin_update_wheel_prize
- ✅ admin_upsert_setting
- ✅ admin_get_instant_stats
- ✅ admin_get_instant_bet_types / admin_update_instant_bet_type / admin_toggle_instant_bet_type
- ✅ admin_get_instant_draws / admin_get_instant_bets

### Database Migrations Applied
- ✅ 001_admin_notifications.sql
- ✅ 002_enable_realtime.sql
- ✅ 003_update_instant_bet_types.sql (9 ประเภท + rates 3.2/4.2 + status WIN/LOSE)
- ✅ 004_fix_settle_instant_draw_status.sql (UPDATE status='SETTLED')

---

## System Information

### Deployment
- **Admin URL:** https://th-lotto-admin-five.vercel.app
- **GitHub:** thlotto3239-star/TH-LOTTO-Admin-push (branch: master)
- **Deploy:** git push origin master → Vercel auto-deploy (ไม่ต้องรัน CLI)
- **Latest Commit:** 50ca393 (2026-06-07) — CLAUDE.md complete rewrite

### Database
- **Supabase** ygopnjbvccenryejqmlw (shared with User App)
- **Tables หวยหลัก:** bets, lottery_results, draw_schedules, lottery_markets
- **Tables หวย 1 นาที:** instant_bets, instant_draws, instant_bet_types
- **Tables ร่วม:** wallets, profiles, settings, promotions, banks

### Stack
- React 19.1.0
- Vite 6.3.5
- Tailwind CSS 3.4.17
- Supabase 2.49.4
- React Router DOM 7.5.3
- Lucide React 0.511.0
- Recharts 2.15.3
- date-fns 3.6.0
- SweetAlert2 11.26.25

---

## Known Issues
- `instant_draws.settled_at` ไม่ถูก set (เล็กน้อย — ไม่กระทบ logic)
- `package.json version` ยังเป็น 1.3.0 (ไม่กระทบ runtime)

---

## Development Notes

### File Structure
- `src/pages/` - หน้าแอดมิน 26 หน้า
- `src/components/` - Component ที่ใช้ร่วมกัน (Layout, Toast, Modal, BankBadge ฯลฯ)
- `src/services/` - authService, logger
- `src/utils/` - notifications, alert
- `src/contexts/` - ModalContext
- `supabase/migrations/` - Database migrations 4 ไฟล์

### Conventions
- Lucide React สำหรับ icons หน้า
- Material Icons สำหรับ sidebar
- Tailwind CSS สำหรับ styling
- Supabase RPC สำหรับ database mutations
- React Router DOM สำหรับ routing (lazy load ทุกหน้า)

### Development Workflow
1. อ่าน CLAUDE.md ก่อนทำงานทุกครั้ง
2. Read ไฟล์จริงก่อนแก้โค้ด
3. Commit + push origin master
4. อัปเดต CLAUDE.md + CHANGELOG.md + PROJECT_STATUS.md
5. Commit docs + push
