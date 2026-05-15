# PROJECT STATUS - TH-LOTTO Admin Panel

## Current State

### Version
- **Current Version**: v1.0.7 (2026-05-16)
- **Previous Version**: v1.0.5 (2026-05-15)

### Admin Panel Features
- ✅ Dashboard - ภาพรวมระบบ
- ✅ Members - จัดการสมาชิก
- ✅ Deposits - รายการฝากเงิน
- ✅ Withdrawals - รายการถอนเงิน
- ✅ Lottery Markets - จัดการตลาดหวย
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

### Instant Lottery Features
- ✅ InstantOverview - ภาพรวมหวยหนึ่งนาที
- ✅ InstantBetTypes - จัดการประเภทเดิมพัน
- ✅ InstantDraws - จัดการงวดออกรางวัล
- ✅ InstantBets - ดูรายการแทง
- ✅ InstantSettings - ตั้งค่าระบบ
- ✅ InstantResults - ผลรางวัล

### Admin RPCs
- ✅ admin_get_instant_bet_types - ดึงข้อมูลประเภทเดิมพัน
- ✅ admin_get_instant_draws - ดึงข้อมูลงวดออกรางวัล
- ✅ admin_get_instant_bets - ดึงข้อมูลรายการแทง
- ✅ admin_update_instant_bet_type - อัพเดทประเภทเดิมพัน
- ✅ admin_toggle_instant_bet_type - เปิด/ปิดประเภทเดิมพัน
- ✅ admin_get_instant_stats - ดึงสถิติ

---

## System Information

### Deployment
- **Live URL:** https://th-lotto-admin.vercel.app
- **GitHub:** thlotto3239-star/TH-LOTTO-Admin-push (branch: master)
- **Deploy Command:** git push origin master then npx vercel --prod --yes
- **Latest Deployment:** v1.0.7 (2026-05-16) - อัพเดทเอกสารให้ตรงกับ v1.0.6

### Database
- **Supabase** (shared with User App)
- **Tables:** instant_bet_types, instant_draws, instant_bets

### Stack
- React 19.1.0
- Vite 6.3.5
- Tailwind CSS 3.4.17
- Supabase 2.49.4
- React Router DOM 7.5.3
- Lucide React 0.511.0
- Recharts 2.15.3
- date-fns 3.6.0

---

## Known Issues
- ไม่มีปัญหาที่รู้จักในขณะนี้

---

## Development Notes

### File Structure
- `src/pages/` - หน้าแอดมินทั้งหมด
- `src/components/` - Component ที่ใช้ร่วมกัน
- `src/utils/` - Utility functions
- `supabase/migrations/` - Database migrations

### Conventions
- ใช้ Lucide React สำหรับ icons
- ใช้ Material Icons สำหรับ sidebar
- ใช้ Tailwind CSS สำหรับ styling
- ใช้ Supabase RPC สำหรับ database operations
- ใช้ React Router DOM สำหรับ routing

### Development Workflow
1. อ่านเอกสารก่อนทำงาน
2. รัน workflow /checkpoint ก่อนแก้โค้ด
3. ตรวจ field name จาก RPC/DB ก่อนเรียก
4. Commit + push + deploy
5. อัพเดต CHANGELOG.md + PROJECT_STATUS.md
6. Commit docs + push + deploy
