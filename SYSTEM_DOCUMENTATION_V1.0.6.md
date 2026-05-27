# เอกสารระบบฉบับเต็ม - TH-LOTTO Admin Panel v1.0.6

## รายละเอียดระบบทั้งหมด (ฉบับเต็ม)

### 1. ข้อมูลโปรเจค

- **Version:** v1.0.6
- **วันที่:** 2026-05-15
- **GitHub:** thlotto3239-star/TH-LOTTO-Admin-push (branch: master)
- **Vercel Project:** th-lotto-admin (prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM)
- **Live URL:** https://th-lotto-admin.vercel.app
- **Deployment ID:** dpl_2YkuCR1URoCxLnzwGS6P3qfSSLTe
- **Commit:** 272657265c5043aa460e7327c34a6fbafba9d115

---

### 2. สถาปัตยกรรมระบบ

#### 2.1 Frontend (Admin Panel)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **UI Components:** Custom components (Table, SearchInput, FilterButton, Modal, StatusBadge, BankBadge, Toast)
- **Routing:** React Router
- **Icons:** Lucide React
- **Charts:** Recharts

#### 2.2 Backend (Supabase)
- **Database:** PostgreSQL
- **Auth:** Supabase Auth
- **Realtime:** Supabase Realtime
- **RPC Functions:** Custom PostgreSQL functions
- **Edge Functions:** Supabase Edge Functions

#### 2.3 Deployment
- **Platform:** Vercel
- **CI/CD:** GitHub Integration (Auto-deploy on push to master)

---

### 3. ตารางฐานข้อมูล (Database Tables)

#### 3.1 ตารางหลัก (Main System)
- **profiles** - ข้อมูลผู้ใช้ (id, member_id, full_name, phone, bank_name, bank_account_number, bank_account_name, is_admin, status, vip_level, created_at, referrer_id)
- **wallets** - กระเป๋าเงิน (user_id, balance, commission_balance, total_won, total_bets, total_deposit, total_withdraw, updated_at)
- **lottery_markets** - ตลาดหวย (id, name, code, draw_date, is_open, countdown, last_result)
- **lottery_rounds** - งวดหวย (id, lottery_code, draw_date, status, created_at)
- **lottery_results** - ผลหวย (id, lottery_code, draw_date, result_p1, result_bottom2, created_at)
- **bets** - รายการแทงหวยหลัก (id, user_id, lottery_code, draw_date, bet_type, numbers, amount, payout_rate, status, payout_amount, created_at)
- **transactions** - ประวัติธุรกรรม (id, user_id, type, amount, status, details, created_at)
- **announcements** - ประกาศ (id, title, content, is_active, created_at)
- **settings** - ตั้งค่าระบบ (key, value, updated_at)
- **sliders** - สไลเดอร์ (id, title, image_url, link, is_active, order)
- **banks** - ธนาคาร (id, name, code, account_number, is_active)
- **promotions** - โปรโมชั่น (id, title, description, image_url, is_active, start_date, end_date)
- **articles** - บทความ (id, title, content, image_url, is_published, created_at)
- **deposit_requests** - คำขอฝากเงิน (id, user_id, amount, bank_name, account_number, status, created_at)
- **withdraw_requests** - คำขอถอนเงิน (id, user_id, amount, bank_name, account_number, status, created_at)

#### 3.2 ตารางหวยหนึ่งนาที (Instant Lottery)
- **instant_bet_types** - ประเภทเดิมพันหวยหนึ่งนาที (id, bet_type, name_th, name_en, payout_rate, min_bet, max_bet, is_active, description)
- **instant_draws** - งวดออกรางวัลหวยหนึ่งนาที (id, draw_id, result_6d, status, total_bets, total_wagers, total_payouts, created_at, settled_at)
- **instant_bets** - รายการแทงหวยหนึ่งนาที (id, user_id, draw_id, bet_type, numbers, amount, winnings, is_win, status, created_at)

---

### 4. RPC Functions

#### 4.1 RPC Functions หวยหลัก (Main Lottery)
- **fn_place_bet** - แทงหวยหลัก
  - Parameters: p_user_id, p_lottery_code, p_draw_date, p_bet_type, p_numbers, p_amount, p_payout_rate
  - Returns: bet_id
  - Logic: ตรวจสอบยอดเงิน, หักเงิน, บันทึก bet, บันทึก transaction

- **fn_settle_result** - ตรวจผลและจ่ายรางวัลหวยหลัก
  - Parameters: p_lottery_code, p_draw_date
  - Returns: winner_count
  - Logic: ดึงผลหวย, ตรวจแต่ละ bet, คำนวณรางวัล, จ่ายเงิน, บันทึก transaction

- **calculate_commission** - คำนวณคอมมิชชั่น
  - Trigger: AFTER INSERT ON bets
  - Logic: ดึงอัตราคอมมิชชั่น, ดึง referrer, คำนวณคอมมิชชั่น, อัพเดทกระเป๋า, บันทึก transaction

- **process_lottery_results** - ประมวลผลหวยหลัก
  - Parameters: p_lottery_code, p_draw_date
  - Returns: winner_count
  - Logic: ดึงผลหวย, วนผ่าน bets ทั้งหมด, ตรวจแต่ละประเภท, คำนวณรางวัล, จ่ายเงิน

#### 4.2 RPC Functions หวยหนึ่งนาที (Instant Lottery)
- **fn_place_instant_bet** - แทงหวยหนึ่งนาที
  - Parameters: p_user_id, p_draw_id, p_bet_type, p_numbers, p_amount
  - Returns: bet_id
  - Logic: ตรวจสอบยอดเงิน, หักเงิน, บันทึก instant_bet, บันทึก transaction

- **fn_instant_draw** - สุ่มผลหวยหนึ่งนาที
  - Parameters: ไม่มี
  - Returns: draw_id
  - Logic: สุ่มเลข 6 หลัก, บันทึกลง instant_draws, เรียก fn_settle_instant_draw

- **fn_settle_instant_draw** - ตรวจผลและจ่ายรางวัลหวยหนึ่งนาที
  - Parameters: p_draw_id
  - Returns: winner_count
  - Logic: ดึงงวด, ดึง bets, ตรวจแต่ละ bet, คำนวณรางวัล, จ่ายเงิน, บันทึก transaction

- **fn_check_instant_win** - ตรวจว่าถูกรางวัลหวยหนึ่งนาที
  - Parameters: p_bet_type, p_numbers, p_result
  - Returns: is_win, payout_amount
  - Logic: ตรวจตามประเภทเดิมพัน (2top, 2bottom, 3top, 3toad, 3front, 3back, pin_top, pin_bottom, 6straight)

- **fn_get_instant_result** - ดึงผลหวยหนึ่งนาทีล่าสุด
  - Parameters: ไม่มี
  - Returns: draw_id, result_6d, created_at
  - Logic: ดึงงวดล่าสุดจาก instant_draws

- **fn_get_instant_popup** - ดึงข้อมูล popup หวยหนึ่งนาที
  - Parameters: p_draw_id
  - Returns: draw_id, result_6d, bets_count, total_wagers
  - Logic: ดึงข้อมูลงวดและสถิติ

- **fn_get_instant_bets** - ดึงรายการแทงหวยหนึ่งนาที
  - Parameters: p_user_id, p_limit
  - Returns: array of bets
  - Logic: ดึง instant_bets ตาม user_id

#### 4.3 Admin RPC Functions
- **admin_dashboard_stats** - ดึงสถิติ Dashboard
  - Returns: total_members, new_today, total_balance, today_deposit, pending_deposits, pending_withdraws, today_bets, today_payouts

- **admin_get_instant_bet_types** - ดึงข้อมูลประเภทเดิมพัน
  - Returns: array of instant_bet_types
  - Logic: ดึงข้อมูลทั้งหมดจาก instant_bet_types

- **admin_get_instant_draws** - ดึงข้อมูลงวดออกรางวัล
  - Parameters: p_limit, p_offset
  - Returns: array of instant_draws
  - Logic: ดึงข้อมูลจาก instant_draws พร้อมสถิติ

- **admin_get_instant_bets** - ดึงข้อมูลรายการแทง
  - Parameters: p_limit, p_offset, p_draw_id
  - Returns: array of instant_bets
  - Logic: ดึงข้อมูลจาก instant_bets พร้อมข้อมูล user

- **admin_update_instant_bet_type** - อัพเดทประเภทเดิมพัน
  - Parameters: p_id, p_name_th, p_name_en, p_payout_rate, p_min_bet, p_max_bet, p_description
  - Returns: success
  - Logic: อัพเดทข้อมูลใน instant_bet_types

- **admin_toggle_instant_bet_type** - เปิด/ปิดประเภทเดิมพัน
  - Parameters: p_id
  - Returns: success
  - Logic: toggle is_active ใน instant_bet_types

- **admin_get_instant_stats** - ดึงสถิติหวยหนึ่งนาที
  - Returns: total_draws, total_bets, total_wagers, total_payouts
  - Logic: คำนวณสถิติจาก instant_draws และ instant_bets

- **admin_update_member** - อัพเดทข้อมูลสมาชิก
  - Parameters: p_user_id, p_patch
  - Returns: success
  - Logic: อัพเดทข้อมูลใน profiles

- **admin_adjust_wallet** - ปรับยอดเงินกระเป๋า
  - Parameters: p_user_id, p_delta, p_note
  - Returns: success
  - Logic: ปรับ balance ใน wallets, บันทึก transaction

- **get_markets_with_countdown** - ดึงตลาดหวยพร้อม countdown
  - Returns: array of markets
  - Logic: ดึง lottery_markets พร้อมคำนวณ countdown

---

### 5. หน้า Admin Panel (ทั้งหมด 26 หน้า)

#### 5.1 Dashboard (ภาพรวมระบบ)
**ไฟล์:** Dashboard.jsx

**ฟังก์ชัน:**
- แสดง KPI Cards (สมาชิกทั้งหมด, ยอดเงินรวม, รอ Approve ฝาก, รอ Approve ถอน)
- แสดง Secondary KPI (ยอดแทงวันนี้, จ่ายรางวัลทั้งหมด, กำไรสุทธิ, ตลาดที่เปิดอยู่)
- แสดง Bar Chart (วิเคราะห์รายได้ 7 วัน)
- แสดง Market Status (ตลาดที่เปิดรับ)
- แสดง Realtime Feed (รายการเรียลไทม์)

**RPC Functions:**
- admin_dashboard_stats
- get_markets_with_countdown

**Realtime:**
- อัพเดทอัตโนมัติเมื่อมี transaction ใหม่
- Refresh ทุก 60 วินาที

---

#### 5.2 Members (จัดการสมาชิก)
**ไฟล์:** Members.jsx

**ฟังก์ชัน:**
- แสดงรายการสมาชิกทั้งหมด
- ค้นหาสมาชิก (ชื่อ, เบอร์, Member ID)
- แก้ไขข้อมูลสมาชิก (ชื่อ, เบอร์, ธนาคาร, สถานะ, VIP Level)
- ปรับยอดเงินกระเป๋า (เพิ่ม/ลด)
- ดูรายละเอียดสมาชิก

**RPC Functions:**
- admin_update_member
- admin_adjust_wallet

**Columns:**
- สมาชิก (ชื่อ, Member ID, เบอร์)
- ยอดเงิน
- แทงรวม
- ถูกรางวัล
- สถานะ
- สมัครเมื่อ
- จัดการ

---

#### 5.3 MemberDetail (รายละเอียดสมาชิก)
**ไฟล์:** MemberDetail.jsx

**ฟังก์ชัน:**
- แสดงข้อมูลสมาชิกแบบละเอียด
- แสดงประวัติธุรกรรม
- แสดงประวัติการแทง
- แสดงประวัติการฝาก/ถอน
- ปรับยอดเงินกระเป๋า
- แก้ไขข้อมูลสมาชิก

**RPC Functions:**
- admin_update_member
- admin_adjust_wallet

---

#### 5.4 Deposits (จัดการฝากเงิน)
**ไฟล์:** Deposits.jsx

**ฟังก์ชัน:**
- แสดงรายการคำขอฝากเงิน
- Approve/Reject คำขอฝากเงิน
- ค้นหาและกรองรายการ

**RPC Functions:**
- admin_approve_deposit
- admin_reject_deposit

---

#### 5.5 Withdrawals (จัดการถอนเงิน)
**ไฟล์:** Withdrawals.jsx

**ฟังก์ชัน:**
- แสดงรายการคำขอถอนเงิน
- Approve/Reject คำขอถอนเงิน
- ค้นหาและกรองรายการ

**RPC Functions:**
- admin_approve_withdraw
- admin_reject_withdraw

---

#### 5.6 LotteryMarkets (จัดการตลาดหวย)
**ไฟล์:** LotteryMarkets.jsx

**ฟังก์ชัน:**
- แสดงรายการตลาดหวยทั้งหมด (21 ตลาด)
- เปิด/ปิดตลาดหวย
- ตั้งค่าวันออกรางวัล
- อัพเดทผลหวย

**RPC Functions:**
- admin_update_market
- admin_toggle_market

---

#### 5.7 Results (จัดการผลหวย)
**ไฟล์:** Results.jsx

**ฟังก์ชัน:**
- แสดงผลหวยทั้งหมด
- เพิ่มผลหวยใหม่
- แก้ไขผลหวย

**RPC Functions:**
- admin_add_result
- admin_update_result

---

#### 5.8 BetsList (รายการแทงหวยหลัก)
**ไฟล์:** BetsList.jsx

**ฟังก์ชัน:**
- แสดงรายการแทงหวยหลักทั้งหมด
- ค้นหาและกรองรายการ
- ดูรายละเอียดรายการแทง

**RPC Functions:**
- admin_get_bets

---

#### 5.9 WheelAdmin (จัดการกงล้อ)
**ไฟล์:** WheelAdmin.jsx

**ฟังก์ชัน:**
- แสดงรายการกงล้อทั้งหมด
- เพิ่ม/แก้ไข/ลบกงล้อ
- ตั้งค่ารูปภาพกงล้อ
- ตั้งค่ารางวัล

**RPC Functions:**
- admin_add_wheel
- admin_update_wheel
- admin_delete_wheel

---

#### 5.10 Settings (ตั้งค่าระบบ)
**ไฟล์:** Settings.jsx

**ฟังก์ชัน:**
- แสดงตั้งค่าระบบทั้งหมด
- แก้ไขตั้งค่าระบบ
- ตั้งค่าอัตราคอมมิชชั่น
- ตั้งค่าขั้นต่ำ/สูงในการแทง

**RPC Functions:**
- admin_update_setting

---

#### 5.11 Sliders (จัดการสไลเดอร์)
**ไฟล์:** Sliders.jsx

**ฟังก์ชัน:**
- แสดงรายการสไลเดอร์ทั้งหมด
- เพิ่ม/แก้ไข/ลบสไลเดอร์
- จัดลำดับสไลเดอร์

**RPC Functions:**
- admin_add_slider
- admin_update_slider
- admin_delete_slider

---

#### 5.12 Banks (จัดการธนาคาร)
**ไฟล์:** Banks.jsx

**ฟังก์ชัน:**
- แสดงรายการธนาคารทั้งหมด
- เพิ่ม/แก้ไข/ลบธนาคาร
- เปิด/ปิดธนาคาร

**RPC Functions:**
- admin_add_bank
- admin_update_bank
- admin_delete_bank

---

#### 5.13 Promotions (จัดการโปรโมชั่น)
**ไฟล์:** Promotions.jsx

**ฟังก์ชัน:**
- แสดงรายการโปรโมชั่นทั้งหมด
- เพิ่ม/แก้ไข/ลบโปรโมชั่น
- เปิด/ปิดโปรโมชั่น

**RPC Functions:**
- admin_add_promotion
- admin_update_promotion
- admin_delete_promotion

---

#### 5.14 Articles (จัดการบทความ)
**ไฟล์:** Articles.jsx

**ฟังก์ชัน:**
- แสดงรายการบทความทั้งหมด
- เพิ่ม/แก้ไข/ลบบทความ
- เผยแพร่/ซ่อนบทความ

**RPC Functions:**
- admin_add_article
- admin_update_article
- admin_delete_article

---

#### 5.15 Admins (จัดการแอดมิน)
**ไฟล์:** Admins.jsx

**ฟังก์ชัน:**
- แสดงรายการแอดมินทั้งหมด
- เพิ่ม/แก้ไข/ลบแอดมิน
- ตั้งค่าสิทธิ์แอดมิน

**RPC Functions:**
- admin_add_admin
- admin_update_admin
- admin_delete_admin

---

#### 5.16 Appearance (จัดการหน้าตา)
**ไฟล์:** Appearance.jsx

**ฟังก์ชัน:**
- ตั้งค่าสีและธีม
- ตั้งค่าโลโก้
- ตั้งค่า favicon

**RPC Functions:**
- admin_update_appearance

---

#### 5.17 DataManagement (จัดการข้อมูล)
**ไฟล์:** DataManagement.jsx

**ฟังก์ชัน:**
- สำรองข้อมูล
- คืนค่าข้อมูล
- ล้างข้อมูล

**RPC Functions:**
- admin_backup_data
- admin_restore_data
- admin_cleanup_data

---

#### 5.18 RestrictedNumbers (จัดการเลขต้องห้าม)
**ไฟล์:** RestrictedNumbers.jsx

**ฟังก์ชัน:**
- แสดงรายการเลขต้องห้าม
- เพิ่ม/แก้ไข/ลบเลขต้องห้าม

**RPC Functions:**
- admin_add_restricted_number
- admin_update_restricted_number
- admin_delete_restricted_number

---

#### 5.19 TestConnection (ทดสอบการเชื่อมต่อ)
**ไฟล์:** TestConnection.jsx

**ฟังก์ชัน:**
- ทดสอบการเชื่อมต่อกับ Supabase
- ทดสอบการเชื่อมต่อกับ Vercel
- แสดงสถานะการเชื่อมต่อ

**RPC Functions:**
- admin_test_connection

---

#### 5.20 Login (เข้าสู่ระบบ)
**ไฟล์:** Login.jsx

**ฟังก์ชัน:**
- เข้าสู่ระบบด้วย email/password
- ตรวจสอบสิทธิ์แอดมิน
- จัดการ session

**RPC Functions:**
- admin_login

---

#### 5.21 InstantOverview (ภาพรวมหวยหนึ่งนาที)
**ไฟล์:** InstantOverview.jsx

**ฟังก์ชัน:**
- แสดงสถิติหวยหนึ่งนาที
- แสดงงวดล่าสุด
- แสดงรายการแทงล่าสุด
- แสดงกราฟรายได้

**RPC Functions:**
- admin_get_instant_stats
- admin_get_instant_draws
- admin_get_instant_bets

---

#### 5.22 InstantBetTypes (จัดการประเภทเดิมพันหวยหนึ่งนาที)
**ไฟล์:** InstantBetTypes.jsx

**ฟังก์ชัน:**
- แสดงรายการประเภทเดิมพันทั้งหมด
- แก้ไขประเภทเดิมพัน (ชื่อ, อัตราจ่าย, ขั้นต่ำ/สูง)
- เปิด/ปิดประเภทเดิมพัน

**RPC Functions:**
- admin_get_instant_bet_types
- admin_update_instant_bet_type
- admin_toggle_instant_bet_type

**Columns:**
- ประเภท (bet_type, name_th, name_en)
- อัตราจ่าย (payout_rate)
- ขั้นต่ำ/สูง (min_bet, max_bet)
- สถานะ (is_active)
- จัดการ

---

#### 5.23 InstantDraws (จัดการงวดออกรางวัลหวยหนึ่งนาที)
**ไฟล์:** InstantDraws.jsx

**ฟังก์ชัน:**
- แสดงรายการงวดออกรางวัลทั้งหมด
- ดูรายละเอียดงวด
- ค้นหาและกรองรายการ
- Export ข้อมูล

**RPC Functions:**
- admin_get_instant_draws

**Columns:**
- งวด (draw_id)
- ผล (result_6d)
- สถานะ (status)
- รายการแทง (total_bets)
- ยอดเงิน (total_wagers)
- จ่ายรางวัล (total_payouts)
- สร้างเมื่อ (created_at)
- จ่ายเมื่อ (settled_at)

---

#### 5.24 InstantBets (ดูรายการแทงหวยหนึ่งนาที)
**ไฟล์:** InstantBets.jsx

**ฟังก์ชัน:**
- แสดงรายการแทงหวยหนึ่งนาทีทั้งหมด
- ค้นหาและกรองรายการ
- Export ข้อมูล

**RPC Functions:**
- admin_get_instant_bets

**Columns:**
- ผู้ใช้ (phone)
- งวด (draw_id)
- ประเภท (bet_type)
- ตัวเลข (numbers)
- จำนวนเงิน (amount)
- รางวัล (winnings)
- ถูกรางวัล (is_win)
- สถานะ (status)
- สร้างเมื่อ (created_at)

---

#### 5.25 InstantSettings (ตั้งค่าระบบหวยหนึ่งนาที)
**ไฟล์:** InstantSettings.jsx

**ฟังก์ชัน:**
- ตั้งค่าระบบหวยหนึ่งนาที
- ตั้งค่าเวลาออกรางวัล
- ตั้งค่าขีดจำกัดการแทง

**RPC Functions:**
- admin_update_instant_setting

---

#### 5.26 InstantResults (ผลรางวัลหวยหนึ่งนาที)
**ไฟล์:** InstantResults.jsx

**ฟังก์ชัน:**
- แสดงผลรางวัลหวยหนึ่งนาทีทั้งหมด
- ดูผลรางวัลแบบละเอียด
- ค้นหาและกรองรายการ

**RPC Functions:**
- admin_get_instant_draws

---

### 6. การทำงานของระบบหวยหนึ่งนาที

#### 6.1 การแทง (Betting)
1. ผู้ใช้เลือกประเภทเดิมพัน (9 ประเภท):
   - 2top (2 ตัวบน)
   - 2bottom (2 ตัวล่าง)
   - 3top (3 ตัวบน)
   - 3toad (3 ตัวโต๊ด)
   - 3front (3 ตัวหน้า)
   - 3back (3 ตัวท้าย)
   - pin_top (ปักหลักบน)
   - pin_bottom (ปักหลักล่าง)
   - 6straight (6 ตัวตรง)

2. ผู้ใช้กรอกตัวเลขและจำนวนเงิน

3. เรียก RPC `fn_place_instant_bet`
   - Parameters: p_user_id, p_draw_id, p_bet_type, p_numbers, p_amount

4. ตรวจสอบยอดเงินในกระเป๋า (wallets.balance)

5. หักเงินจากกระเป๋า (wallets.balance -= amount)

6. บันทึกข้อมูลลง `instant_bets`
   - user_id, draw_id, bet_type, numbers, amount, status='pending'

7. บันทึก transaction ลง `transactions`
   - user_id, type='BET', amount, status='SUCCESS', details

#### 6.2 การออกรางวัล (Drawing)
1. pg_cron ทำงานทุก 1 นาที (jobid 14)

2. เรียก RPC `fn_instant_draw`

3. สุ่มเลข 6 หลัก (000000-999999)

4. บันทึกผลลง `instant_draws`
   - draw_id (format: YYYYMMDDHHMM)
   - result_6d
   - status='pending'
   - created_at

5. เรียก RPC `fn_settle_instant_draw` เพื่อตรวจผล

#### 6.3 การตรวจผลและจ่ายรางวัล (Settling)
1. เรียก RPC `fn_settle_instant_draw`
   - Parameters: p_draw_id

2. ดึงข้อมูลงวดล่าสุดจาก `instant_draws`
   - draw_id, result_6d

3. ดึงข้อมูลรายการแทงทั้งหมดจาก `instant_bets`
   - WHERE draw_id = p_draw_id AND status = 'pending'

4. ตรวจสอบแต่ละรายการแทงด้วย `fn_check_instant_win`
   - Parameters: p_bet_type, p_numbers, p_result
   - Returns: is_win, payout_amount

5. ถ้าถูกรางวัล (is_win = true):
   - คำนวณยอดรางวัล (amount * payout_rate)
   - เพิ่มเงินเข้ากระเป๋า (wallets.balance += payout_amount)
   - อัพเดท `is_win = true` และ `winnings = payout_amount` ใน `instant_bets`
   - อัพเดท `status = 'won'` ใน `instant_bets`
   - บันทึก transaction ลง `transactions`
     - user_id, type='WIN', amount=payout_amount, status='SUCCESS', details

6. ถ้าไม่ถูกรางวัล (is_win = false):
   - อัพเดท `is_win = false` และ `winnings = 0` ใน `instant_bets`
   - อัพเดท `status = 'lost'` ใน `instant_bets`

7. อัพเดท `status = 'settled'` และ `settled_at = NOW()` ใน `instant_draws`
8. อัพเดท `total_bets`, `total_wagers`, `total_payouts` ใน `instant_draws`

---

### 7. การเชื่อมต่อระบบ

#### 7.1 การเชื่อมต่อกับ Supabase
- **URL:** https://your-project.supabase.co
- **Anon Key:** ใช้สำหรับการเข้าถึงข้อมูล (Client-side)
- **Service Role Key:** ใช้สำหรับการจัดการข้อมูล (Admin-side)
- **Realtime:** เปิดใช้งานสำหรับการอัพเดทแบบ real-time

#### 7.2 การเชื่อมต่อกับ Vercel
- **Project ID:** prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM
- **Branch:** master
- **Auto-deploy:** เปิดใช้งาน (deploy อัตโนมัติเมื่อ push ไป master)
- **Environment Variables:** SUPABASE_URL, SUPABASE_ANON_KEY

---

### 8. Components ทั้งหมด

#### 8.1 Table Component
**ไฟล์:** Table.jsx

**ฟังก์ชัน:**
- แสดงข้อมูลในรูปแบบตาราง
- รองรับ loading state
- รองรับ empty state
- รองรับ hover effect

#### 8.2 SearchInput Component
**ไฟล์:** SearchInput.jsx

**ฟังก์ชัน:**
- ช่องค้นหาพร้อม icon
- รองรับ clear button
- รองรับ placeholder

#### 8.3 FilterButton Component
**ไฟล์:** FilterButton.jsx

**ฟังก์ชัน:**
- ปุ่มกรองข้อมูล
- รองรับ active/inactive state
- รองรับ icon

#### 8.4 Modal Component
**ไฟล์:** Modal.jsx

**ฟังก์ชัน:**
- แสดง modal dialog
- รองรับหลายประเภท (success, error, warning, info, confirm)
- รองรับ loading state
- รองรับ confirmation action

#### 8.5 StatusBadge Component
**ไฟล์:** StatusBadge.jsx

**ฟังก์ชัน:**
- แสดง status badge
- รองรับหลายสถานะ (active, inactive, pending, error, success)
- รองรับ icon
- รองรับ custom size

#### 8.6 BankBadge Component
**ไฟล์:** BankBadge.jsx

**ฟังก์ชัน:**
- แสดง badge ธนาคาร
- รองรับ 10 ธนาคารหลัก (KBANK, SCB, KTB, BBL, BAY, TMB, CIMB, TTB, GSB, BAAC)
- รองรับ custom color

#### 8.7 Toast Component
**ไฟล์:** Toast.jsx

**ฟังก์ชัน:**
- แสดง notification
- รองรับหลายประเภท (success, error, warning, info)
- รองรับ auto-dismiss

---

### 9. ความปลอดภัย

#### 9.1 Row Level Security (RLS)
- เปิดใช้งาน RLS บนทุกตาราง
- ผู้ใช้สามารถเข้าถึงข้อมูลของตัวเองเท่านั้น
- Admin สามารถเข้าถึงข้อมูลทั้งหมด
- Policies:
  - profiles: SELECT, UPDATE (own record or admin)
  - wallets: SELECT, UPDATE (own record or admin)
  - bets: SELECT (own record or admin)
  - transactions: SELECT (own record or admin)

#### 9.2 JWT Authentication
- ใช้ Supabase Auth สำหรับการยืนยันตัวตน
- Token หมดอายุทุก 1 ชั่วโมง
- Refresh token ใช้สำหรับต่ออายุ session

#### 9.3 Admin Authentication
- ตรวจสอบ is_admin ใน profiles
- เฉพาะ admin เท่านั้นที่เข้าถึง Admin Panel ได้
- RPC functions บางอย่างต้องการ admin privileges

---

### 10. การจัดการข้อมูล

#### 10.1 การสำรองข้อมูล (Backup)
- Supabase สำรองข้อมูลอัตโนมัติทุกวัน
- สามารถดาวน์โหลด backup ได้จาก Supabase Dashboard
- สามารถ restore ได้จาก backup ที่สำรองไว้

#### 10.2 การล้างข้อมูล (Cleanup)
- ยังไม่มีระบบล้างข้อมูลอัตโนมัติใน v1.0.6
- ต้องล้างข้อมูลด้วยตนเองผ่าน SQL

---

### 11. การตรวจสอบและแก้ไขปัญหา

#### 11.1 Logs
- **Supabase Logs:** ดูได้จาก Supabase Dashboard
  - Database Logs
  - Auth Logs
  - Edge Function Logs
- **Vercel Logs:** ดูได้จาก Vercel Dashboard
  - Build Logs
  - Runtime Logs
  - Function Logs

#### 11.2 Monitoring
- **Supabase Dashboard:** ตรวจสอบสถานะ database
  - Database Health
  - Storage Usage
  - API Usage
- **Vercel Dashboard:** ตรวจสอบสถานะ deployment
  - Deployment Status
  - Performance Metrics
  - Error Tracking

---

### 12. สรุปการทำงานของ v1.0.6

**สิ่งที่ทำงานได้:**
- ✅ ระบบหวยหลัก (21 ตลาดหวย)
- ✅ ระบบหวยหนึ่งนาที (9 ประเภทเดิมพัน)
- ✅ ระบบกระเป๋าเงิน
- ✅ ระบบ transaction
- ✅ ระบบคอมมิชชั่น
- ✅ Admin Panel ทั้งหมด (26 หน้า)
- ✅ RPC functions ทั้งหมด
- ✅ Realtime updates
- ✅ Row Level Security (RLS)
- ✅ JWT Authentication

**สิ่งที่ไม่มีใน v1.0.6:**
- ❌ ระบบล้างข้อมูลอัตโนมัติ
- ❌ การแยกประวัติหวยหนึ่งนาทีจากระบบหลัก

**สถานะ:** ระบบทำงานได้ปกติและเสถียร
