# AGENT HANDOFF - TH-LOTTO Admin Panel

## Project Information

### Project Name
TH-LOTTO Admin Panel - ระบบจัดการแอดมินสำหรับ TH-LOTTO Premium

### GitHub Repository
- **Repo:** thlotto3239-star/TH-LOTTO-Admin-push
- **Branch:** master
- **URL:** https://github.com/thlotto3239-star/TH-LOTTO-Admin-push

### Deployment
- **Live URL:** https://th-lotto-admin.vercel.app
- **Vercel Project ID:** prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM
- **Deploy Command:** git push origin master then npx vercel --prod --yes

### Local Development
- **Local Path:** D:\TH-LOTTO-Projects\TH-LOTTO-Admin-push

---

## Architecture

### Tech Stack
- **Frontend:** React 19.1.0 + Vite 6.3.5 + Tailwind CSS 3.4.17
- **Backend:** Supabase 2.49.4 (PostgreSQL)
- **Routing:** React Router DOM 7.5.3
- **Icons:** Lucide React 0.511.0 + Material Icons
- **Charts:** Recharts 2.15.3
- **Date Utilities:** date-fns 3.6.0

### Project Structure
- `src/pages/` - หน้าแอดมินทั้งหมด
- `src/components/` - Component ที่ใช้ร่วมกัน
- `src/utils/` - Utility functions
- `supabase/migrations/` - Database migrations

---

## Relationship with User App

### User App (thlotto-premium)
- **Repo:** thlotto3239-star/thlotto-premium
- **Branch:** main
- **URL:** https://th-lotto-app.vercel.app
- **Vercel Project ID:** prj_tJriP88kWcWOSUQOo8E0UrwSJb7v

### Database Sharing
- **Shared Database:** Supabase (เดียวกับ User App)
- **Shared Tables:** profiles, wallets, transactions, notifications, deposit_requests, withdraw_requests, lottery_markets, lottery_results, bets, payout_rates, draw_schedules, restricted_numbers, settings, trending_items, lucky_wheel_spins, lucky_wheel_prizes, login_attempts, admin_notifications

### Instant Lottery Tables (Admin Panel + User App)
- **instant_bet_types** - ประเภทแทงหวยหนึ่งนาที (9 ประเภท)
- **instant_draws** - งวดออกรางวัลหวยหนึ่งนาที
- **instant_bets** - รายการแทงหวยหนึ่งนาที

### Separate Systems
- **Main Lottery (21 markets):** User App และ Admin Panel ใช้ระบบเดียวกัน
- **Instant Lottery:** User App และ Admin Panel ใช้ระบบเดียวกัน แต่แยกจาก Main Lottery
- **RPC Functions:** User App RPCs และ Admin RPCs แยกกันโดยสมบูรณ์

---

## Current Features

### Admin Panel Features (v1.0.4)
- ✅ Dashboard - ภาพรวมระบบ
- ✅ Members - จัดการสมาชิก
- ✅ Deposits - รายการฝากเงิน
- ✅ Withdrawals - รายการถอนเงิน
- ✅ Lottery Markets - จัดการตลาดหวย (21 ตลาด)
- ✅ Results - ออกผลรางวัล
- ✅ Bets List - รายการโพย
- ✅ Restricted Numbers - เลขอั้น
- ✅ Wheel Admin - วงล้อโชคดี
- ✅ Settings - ตั้งค่าระบบ
- ✅ Appearance - รูปลักษณ์
- ✅ Sliders - สไลเดอร์
- ✅ Promotions - โปรโมชั่น
- ✅ Articles - บทความ
- ✅ Banks - ธนาคาร
- ✅ Admins - ผู้ดูแลระบบ
- ✅ Data Management - Backup & ข้อมูล
- ✅ Instant Lottery - หวยหนึ่งนาที (6 หน้า)

### Instant Lottery Admin Features
- ✅ InstantOverview - ภาพรวมหวยหนึ่งนาที
- ✅ InstantBetTypes - จัดการประเภทเดิมพัน
- ✅ InstantDraws - จัดการงวดออกรางวัล
- ✅ InstantBets - ดูรายการแทง
- ✅ InstantSettings - ตั้งค่าระบบ
- ✅ InstantResults - ผลรางวัล

---

## Admin RPC Functions

### Main Lottery Admin RPCs
- admin_approve_deposit - อนุมัติการฝากเงิน
- admin_reject_deposit - ปฏิเสธการฝากเงิน
- admin_approve_withdrawal - อนุมัติการถอนเงิน
- admin_reject_withdrawal - ปฏิเสธการถอนเงิน
- admin_set_result_and_settle - ออกผลรางวัลและ settle เดิมพัน
- admin_list_members - ดูรายชื่อสมาชิก
- admin_get_member_details - ดูรายละเอียดสมาชิก
- admin_update_member_status - อัพเดทสถานะสมาชิก
- admin_get_bets - ดูรายการแทง
- admin_get_deposit_requests - ดูรายการฝากเงิน
- admin_get_withdraw_requests - ดูรายการถอนเงิน
- admin_get_stats - ดูสถิติระบบ

### Instant Lottery Admin RPCs
- admin_get_instant_bet_types - ดึงข้อมูลประเภทเดิมพัน
- admin_get_instant_draws - ดึงข้อมูลงวดออกรางวัล
- admin_get_instant_bets - ดึงข้อมูลรายการแทง
- admin_update_instant_bet_type - อัพเดทประเภทเดิมพัน
- admin_toggle_instant_bet_type - เปิด/ปิดประเภทเดิมพัน
- admin_get_instant_stats - ดึงสถิติ

---

## Known Issues

### Previous Issues (Resolved)
- **2026-05-14:** Rollback เนื่องจาก deploy ไป Vercel project ผิด (thlotto-admin ไม่มี dash) และ environment variables หายไป
  - **Solution:** Rollback ไป deployment 2026-05-10 และตรวจสอบ environment variables ก่อน deploy เสมอ
  - **Documentation:** ROLLBACK_2026-05-14.md

### Current Issues
- ไม่มีปัญหาที่รู้จักในขณะนี้

---

## Environment Variables

### Required Environment Variables (Vercel)
- **VITE_SUPABASE_URL:** Supabase Project URL
- **VITE_SUPABASE_ANON_KEY:** Supabase Anon Key

### Check Before Deploy
- ตรวจสอบว่า environment variables มีอยู่ใน Vercel project ก่อน deploy เสมอ
- ตรวจสอบว่า deploy ไป project ถูกต้อง (prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM)
- ตรวจสอบว่า .vercel/project.json มี project ID ถูกต้อง

---

## Workflow

### Before Starting Work
1. Read AGENT_HANDOFF.md (this file)
2. Read PROJECT_GUIDE.md
3. Read AI_WORKFLOW.md
4. Read PROJECT_STATUS.md
5. Read CHANGELOG.md

### Development Workflow
1. **Analyze:** วิเคราะห์สถานะปัจจุบัน
2. **Summarize:** สรุปความเข้าใจ
3. **Request Permission:** ขอ "อนุญาต" จากเจ้าของโปรเจค
4. **Checkpoint:** Run workflow /checkpoint (commit + tag + push)
5. **Code Changes:**
   - ตรวจสอบ repo ที่ถูกต้อง (Admin Panel: TH-LOTTO-Admin-push)
   - อ่านโค้ดเดิมก่อน
   - เทียบ field name frontend vs RPC/DB
   - แก้โค้ด
6. **Deploy:**
   - git add + commit
   - git push origin master
   - npx vercel --prod --yes
   - ตรวจสอบ live site
7. **Update Documentation:**
   - อัพเดท CHANGELOG.md (version ใหม่บนสุด)
   - อัพเดท PROJECT_STATUS.md (version + date + bug table)
   - commit + push + deploy docs

### Forbidden Actions
- ❌ ไม่ต้องไปยุ่งกับระบบหลัก (21 ตลาดหวย) ที่ทำงานได้แล้ว
- ❌ ไม่ deploy ไป project อื่นที่ไม่ใช่ th-lotto-admin
- ❌ ไม่สร้าง Vercel project ใหม่
- ❌ ไม่แก้ auth flow (SHA256)
- ❌ ไม่ลบ DB schema โดยไม่ตรวจสอบ references
- ❌ ไม่ skip documentation updates
- ❌ ไม่ rewrite functions โดยไม่ preserve field names

---

## Important Notes

### Separation of Concerns
- **Admin Panel** และ **User App** เป็น 2 repos แยกกันโดยสมบูรณ์
- **Main Lottery** และ **Instant Lottery** เป็น 2 ระบบแยกกันโดยสมบูรณ์
- ใช้ database เดียวกัน แต่ RPC functions แยกกันโดยสมบูรณ์
- ใช้ wallets เดียวกัน แต่ logic แยกกันโดยสมบูรณ์

### Field Name Consistency
- ต้องเทียบ field name frontend vs RPC/DB ทุกครั้งก่อนแก้โค้ด
- อ่าน RPC function definitions จาก Supabase
- อ่าน database schema จาก Supabase
- อ่าน frontend code จาก GitHub

### Verification
- ใช้ Supabase MCP tools เพื่อตรวจสอบตารางจริง
- ใช้ Vercel MCP tools เพื่อตรวจสอบ deployment history
- ตรวจสอบ project ID ที่ถูกต้องก่อน deploy
- ตรวจสอบ environment variables ก่อน deploy

---

## Contact

### Project Owner
- **GitHub:** thlotto3239-star
- **Email:** (ติดต่อผ่าน GitHub)

### Support
- ถ้ามีปัญหา ให้ตรวจสอบเอกสารใน repo ก่อน
- ถ้ายังไม่แก้ไข ให้ติดต่อ project owner

---

## Last Updated
- **Date:** 2026-05-15
- **Version:** v1.0.4
- **Updated by:** AI Agent
