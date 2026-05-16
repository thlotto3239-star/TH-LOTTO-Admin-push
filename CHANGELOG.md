# CHANGELOG - TH-LOTTO Admin Panel

## [2026-05-16] - v1.0.8

### Fixed - ระบบหวยหนึ่งนาที (Instant Lottery) แยกจากระบบหลัก
- แก้ไข `fn_place_instant_bet()` - ลบการบันทึก transaction ลง transactions table ของระบบหลัก
- แก้ไข `fn_settle_instant_draw()` - ลบการบันทึก transaction ลง transactions table ของระบบหลัก
- สร้าง edge function `cleanup-instant-lottery-data` - ล้างข้อมูลวันต่อวัน (instant_bets, instant_draws)
- ระบบหวยหนึ่งนาทีไม่บันทึกประวัติลง transactions table ของระบบหลักแล้ว
- ระบบหวยหนึ่งนาทีใช้กระเป๋าเงินร่วมกับระบบหลัก แต่ประวัติแยกกัน
- ระบบหวยหนึ่งนาทีล้างข้อมูลวันต่อวันอัตโนมัติ

### Changed
- ระบบหวยหนึ่งนาทีทำงานแยกจากระบบหลัก (21 ตลาดหวย) อย่างสมบูรณ์
- ระบบหวยหนึ่งนาทีใช้กระเป๋าเงินร่วมกับระบบหลัก แต่ประวัติแยกกัน
- ระบบหวยหนึ่งนาทีล้างข้อมูลวันต่อวันอัตโนมัติ

---

## [2026-05-16] - v1.0.7

### Changed - อัพเดทเอกสารให้ตรงกับ v1.0.6
- แก้ไข PROJECT_STATUS.md - แก้ URL ให้ถูกต้อง (th-lotto-admin.vercel.app)
- แก้ไข PROJECT_STATUS.md - อัพเดท Latest Deployment เป็น v1.0.6
- แก้ไข PROJECT_GUIDE.md - อัพเดทเวอร์ชันเป็น v1.0.6
- แก้ไข PROJECT_GUIDE.md - อัพเดทวันที่เป็น 2026-05-15
- แก้ไข AGENT_HANDOFF.md - อัพเดทเวอร์ชันเป็น v1.0.6
- สร้าง DEVELOPMENT_GUIDE.md - เพิ่มคู่มือการพัฒนาสำหรับ Admin Panel

### Removed - ลบไฟล์ขยะ
- ไม่มีไฟล์ขยะใน Admin Panel

---

## [2026-05-15] - v1.0.6

### Fixed - แก้ไข RPC functions ของหวยหนึ่งนาที
- เพิ่ม column `status` และ `settled_at` ในตาราง `instant_draws`
- เพิ่ม column `is_win` ในตาราง `instant_bets`
- แก้ไข `admin_get_instant_bet_types()` - แก้ปัญหา ambiguous column reference
- แก้ไข `admin_get_instant_draws()` - ใช้ column ที่มีจริงในตาราง
- แก้ไข `admin_get_instant_bets()` - ใช้ column ที่มีจริงในตาราง
- แก้ไข `admin_get_instant_stats()` - ใช้ column ที่มีจริงในตาราง
- สร้าง `fn_get_instant_result()` - RPC function ที่ขาดหาย
- ทดสอบ RPC functions ทั้งหมด - ทำงานได้ปกติแล้ว

### Changed
- Schema ของตาราง `instant_draws` และ `instant_bets` ตรงกับ RPC functions แล้ว
- Admin Panel สามารถดึงข้อมูลหวยหนึ่งนาทีได้แล้ว

---

## [2026-05-15] - v1.0.5

### Added - เอกสารกฎและมาตรฐาน
- สร้าง AGENT_HANDOFF.md - เอกสารรวมข้อมูลโปรเจคทั้งหมดสำหรับ AI agents
- อัพเดท AI_WORKFLOW.md - เพิ่มส่วน DOCUMENTATION SEPARATION (CRITICAL) และ forbidden actions
- อัพเดท .windsurfrules - เพิ่มเอกสารที่ต้องอ่านก่อนทำงาน และคำเตือนเรื่องการแยก repo

### Changed
- เปลี่ยนจาก PROJECT_GUIDE.md เป็น AGENT_HANDOFF.md เป็นไฟล์แรกที่ต้องอ่าน
- เพิ่ม PROJECT_STATUS.md, CHANGELOG.md, AI_WORKFLOW.md ในรายการเอกสารที่ต้องอ่าน
- เพิ่มคำเตือนเรื่องการแยก repo (User App vs Admin Panel)
- อัพเดท project ID ให้ถูกต้องใน .windsurfrules (prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM)

---

## [2026-05-15] - v1.0.4

### Fixed
- Rollback deployment ไป deployment ใหม่ (dpl_HvB4HDP1EiuwgG4FZppautEPtXeD) ที่มี commit 53dcb41 (force deploy: include instant lottery changes)
- ยืนยันว่า th-lotto-admin.vercel.app ชี้ไป deployment ใหม่ที่มีเมนู "หวยหนึ่งนาที"
- ยืนยันว่าหวยหนึ่งนาทีแสดงที่ https://th-lotto-admin.vercel.app สำเร็จ

### Changed
- Rollback deployment ไป commit ล่าสุด (53dcb41) ที่มีเมนู "หวยหนึ่งนาที"
- th-lotto-admin.vercel.app ชี้ไป deployment ใหม่ที่มีเมนู "หวยหนึ่งนาที"

---

## [2026-05-14] - v1.0.3

### Fixed
- แก้ไขปัญหา deployment ที่ deploy ไป project ID ผิด
- ยืนยันว่าระบบแอดมินเดิมกลับมาทำงานได้
- ยืนยันว่าหวยหนึ่งนาทีเพิ่มเข้าไปในระบบแอดมินเดิมสำเร็จ
- Deploy สำเร็จไป https://th-lotto-admin.vercel.app

### Changed
- อัพเดทโดเมนให้ถูกต้อง: https://th-lotto-admin.vercel.app
- อัพเดท project ID ให้ถูกต้อง: prj_z4DBCsWGhIm3Pht4Ocq2kI3jCJPj

---

## [2026-05-14] - v1.0.2

### Changed
- Deploy หวยหนึ่งนาที (Instant Lottery) ไป production
- ยืนยันว่าหวยหนึ่งนาที deploy สำเร็จและใช้งานได้ที่ https://th-lotto-admin.vercel.app

---

## [2026-05-14] - v1.0.1

### Added - หวยหนึ่งนาที (Instant Lottery)
- เพิ่ม 6 RPC สำหรับแอดมิน:
  - `admin_get_instant_bet_types` - ดึงข้อมูลประเภทเดิมพัน
  - `admin_get_instant_draws` - ดึงข้อมูลงวดออกรางวัล
  - `admin_get_instant_bets` - ดึงข้อมูลรายการแทง
  - `admin_update_instant_bet_type` - อัพเดทประเภทเดิมพัน
  - `admin_toggle_instant_bet_type` - เปิด/ปิดประเภทเดิมพัน
  - `admin_get_instant_stats` - ดึงสถิติ
- เพิ่ม 6 หน้าแอดมิน:
  - InstantOverview - ภาพรวมหวยหนึ่งนาที
  - InstantBetTypes - จัดการประเภทเดิมพัน
  - InstantDraws - จัดการงวดออกรางวัล
  - InstantBets - ดูรายการแทง
  - InstantSettings - ตั้งค่าระบบ
  - InstantResults - ผลรางวัล
- เพิ่มเมนู "หวยหนึ่งนาที" ใน sidebar
- เพิ่ม routing สำหรับหน้าหวยหนึ่งนาที

### Changed
- อัพเดต Layout.jsx เพื่อเพิ่มเมนูหวยหนึ่งนาที
- อัพเดต App.jsx เพื่อเพิ่ม routing สำหรับหวยหนึ่งนาที

---

## [Previous Versions]

### 2026-05-10
- เพิ่มส่วนจัดการภาพปกกงล้อ (banner preview, URL input, upload) ใน WheelAdmin.jsx

### 2026-05-07
- เพิ่มหน้า MemberDetail (ดูข้อมูลสมาชิกทั้งหมด)
- Deploy ล่าสุดพร้อม 17 ไฟล์ที่ค้าง
