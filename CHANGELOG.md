# CHANGELOG - TH-LOTTO Admin Panel

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
