# CLAUDE.md — เอกสารระบบหลัก TH LOTTO Admin Panel

> **กฎบังคับ: อ่านไฟล์นี้ทั้งหมดก่อนทำงาน ห้ามข้าม ห้ามตอบจากความจำ**
> อัปเดตล่าสุด: **2026-06-07** | ตรวจสอบจาก Git + Supabase + โค้ดจริงทุกบรรทัด

---

## กฎเหล็ก (ห้ามละเมิด)

1. ห้ามบอกว่า "เสร็จ/ออนไลน์" ถ้ายังไม่ verify จริงจาก DB หรือ git
2. ก่อนแก้โค้ด → อ่านไฟล์จริงก่อนทุกครั้ง ห้ามเขียนจากความจำ
3. หลังแก้เสร็จ → อัปเดต CLAUDE.md + CHANGELOG.md + PROJECT_STATUS.md ทันที
4. ทุก mutation จาก client → ผ่าน Supabase RPC เท่านั้น (ยกเว้น Promotions/Banks/Settings ที่ยังใช้ direct)
5. ห้ามเก็บ password / token / key ใน code หรือไฟล์ใดๆ
6. ก่อน git push → แจ้งผู้ใช้ก่อน + verify ว่า origin HEAD เลื่อนจริง
7. ภาษาไทยสำหรับ UI, error messages, และสื่อสารกับผู้ใช้
8. ห้าม mix ระบบหวยหลัก กับ หวย 1 นาที (คนละตาราง คนละ RPC)
9. ทดสอบ build ผ่านก่อน deploy เสมอ

---

## 1. ข้อมูลโปรเจค

| รายการ | ข้อมูล |
|---|---|
| **Admin Panel URL** | https://th-lotto-admin-five.vercel.app |
| **User App URL** | https://th-lotto-app.vercel.app |
| **GitHub Admin** | thlotto3239-star/TH-LOTTO-Admin-push (branch: **master**) |
| **GitHub User App** | thlotto3239-star/thlotto-premium (branch: **main**) |
| **Supabase Project** | ygopnjbvccenryejqmlw (Tokyo) |
| **Deploy** | Auto-deploy จาก GitHub push (ทั้งสอง Vercel project) |

> ⚠️ **ห้ามใช้** `th-lotto-admin.vercel.app` — project เก่า ไม่ auto-deploy แล้ว

---

## 2. Tech Stack

| ส่วน | เวอร์ชัน |
|---|---|
| React | 19.1.0 |
| Vite | 6.3.5 |
| Tailwind CSS | 3.4.17 |
| Supabase JS | 2.49.4 |
| React Router DOM | 7.5.3 |
| Lucide React | 0.511.0 |
| Recharts | 2.15.3 |
| date-fns | 3.6.0 |
| SweetAlert2 | 11.26.25 |

---

## 3. Git State ล่าสุด (2026-06-07)

### Admin App — master
```
f662aaa  docs: fix CHANGELOG — mark 7262dbb as pushed, remove duplicate sections  ← ล่าสุด
b5c122d  docs: CLAUDE.md อัปเดตสมบูรณ์ v1.3.3
1334381  fix: fn_settle_instant_draw อัปเดต instant_draws.status = SETTLED
e4094a7  docs: update CHANGELOG and PROJECT_STATUS for v1.3.1
0a428f8  fix: sync instant bet status with Apps Script (WIN/LOSE not WON/LOST)
9e4772c  fix: rewrite instant lottery to match Apps Script source exactly
f5a644a  docs: add CLAUDE.md
364a755  feat: Appearance iframe preview + Dashboard แยก section
827e075  feat: Promotions เพิ่ม dropdown allowed_game
aecb82e  feat: Settings — Tracking Pixels + ช่องทางติดตาม + Popup โฆษณา
fc023c9  feat: Settings ใช้ BankSelector แทน TextInput
```

### User App — main
```
7262dbb  fix: pin bet amount = ราคาต่อตัว × picks  ← ล่าสุด (pushed ✅)
1a5a0e2  fix: UI rounded + ตัวหนังสือไม่ตก
99313e9  feat: Popup โฆษณาหน้าแรก
471ebbf  feat: BottomNav วงกลมวิ่งตาม tab
```

---

## 4. โครงสร้างระบบ

### สองระบบแยกกันสนิท — ใช้ wallets ร่วมเท่านั้น

| | หวยหลัก 21 ตลาด | หวย 1 นาที |
|---|---|---|
| **ตาราง DB** | bets, lottery_results, draw_schedules, lottery_markets | instant_bets, instant_draws, instant_bet_types |
| **ID งวด** | draw_schedule_id (UUID) | draw_id (BIGINT = floor(epoch_seconds / 60)) |
| **ผลรางวัล** | Admin กรอกเอง → fn publish → settle | สุ่มอัตโนมัติทุก 1 นาที |
| **settle** | admin_set_result_and_settle() | fn_settle_instant_draw() |
| **ใช้ร่วมกัน** | wallets | wallets |

---

## 5. โครงสร้างไฟล์

```
src/
├── App.jsx                    — routing ทั้งหมด (lazy load ทุกหน้า)
├── AuthContext.jsx            — auth state, permission check
├── AdminGuard.jsx             — redirect ถ้ายังไม่ login
├── supabaseClient.js          — Supabase client instance
├── components/
│   ├── Layout.jsx             — Sidebar + Header + Outlet
│   ├── BankBadge.jsx          — แสดงโลโก้ธนาคาร
│   ├── BankSelector.jsx       — dropdown เลือกธนาคาร
│   ├── Toast.jsx              — notification toast
│   ├── Modal.jsx              — modal wrapper
│   ├── CategoryNav.jsx        — tab navigation
│   ├── StatusBadge.jsx        — status chip
│   ├── Table.jsx              — table wrapper
│   └── ProfessionalTable.jsx  — advanced table
├── contexts/
│   └── ModalContext.jsx       — global modal (confirm/alert)
├── pages/                     — หน้าทั้งหมด (26 หน้า ดูหัวข้อ 6)
├── services/
│   ├── authService.js         — login, session, permissions
│   └── logger.js              — logging utility
└── utils/
    ├── notifications.js       — fetch/subscribe notifications
    └── alert.js               — SweetAlert2 wrapper

supabase/migrations/
├── 001_admin_notifications.sql
├── 002_enable_realtime.sql
├── 003_update_instant_bet_types.sql
└── 004_fix_settle_instant_draw_status.sql
```

---

## 6. หน้าทั้งหมด — ฟังก์ชันละเอียด

### 6.1 Dashboard (`/`)
**ไฟล์:** `src/pages/Dashboard.jsx`

ดึงข้อมูลพร้อมกัน (Promise.all) ทุก 30 วินาที:
- `admin_dashboard_stats` — สมาชิกทั้งหมด, ยอดฝาก/ถอนวันนี้, โพยรอผล
- `admin_dashboard_advanced_stats` — สมาชิก active 7 วัน, top 10 bettors, อัตราถอน
- `transactions` — 7 วันย้อนหลัง → กราฟ Bar chart
- `get_markets_with_countdown` — ตลาดหวยพร้อม countdown ปิดรับ
- `deposit_requests` — 30 รายการล่าสุด (join profiles + approver)
- `withdraw_requests` — 30 รายการล่าสุด
- `bets` — 30 รายการล่าสุด (join profiles + lottery_markets)
- `banks` — map code→{name, image_url} สำหรับโลโก้

แสดงผล:
- KPI cards (สมาชิก, ยอดฝาก, ยอดถอน, โพยรอผล) — mobile: 2 คอลัมน์
- กราฟยอดเงิน 7 วัน
- Feed รายการล่าสุดพร้อมโลโก้ธนาคาร
- ตลาดใกล้ปิดรับ + ผลล่าสุดพร้อมเลข

---

### 6.2 Deposits (`/deposits`)
**ไฟล์:** `src/pages/Deposits.jsx`

- ดึง `deposit_requests` join `profiles` + `approver`
- Filter: PENDING / APPROVED / REJECTED / ALL
- ค้นหา: member_id, phone, full_name (query profiles แยกก่อน)
- ดูสลิป: preview รูปใน modal
- **อนุมัติ:** `admin_approve_deposit({ p_id, p_note })` → เพิ่มเงินใน wallet อัตโนมัติ
- **ปฏิเสธ:** `admin_reject_deposit({ p_id, p_note })`
- Export CSV (UTF-8 BOM รองรับ Excel ไทย)

---

### 6.3 Withdrawals (`/withdrawals`)
**ไฟล์:** `src/pages/Withdrawals.jsx`

- ดึง `withdraw_requests` join `profiles` + `approver`
- Filter: PENDING / APPROVED / REJECTED / ALL
- Copy เลขบัญชี/ชื่อบัญชีปลายทาง
- **อนุมัติ:** `admin_approve_withdrawal({ p_id, p_note })` → หักเงิน wallet
- **ปฏิเสธ:** `admin_reject_withdrawal({ p_id, p_note })` → คืนเงิน wallet
- Export CSV

---

### 6.4 Members (`/members`)
**ไฟล์:** `src/pages/Members.jsx`

- ดึง `profiles` join `wallets` — paginate 20 รายการ/หน้า
- ค้นหา: member_id, phone, full_name
- **แก้ไขสมาชิก:** `admin_update_member({ p_user_id, p_patch })` — แก้ชื่อ, เบอร์, ธนาคาร, สถานะ, VIP level
- **ปรับยอดกระเป๋า:** `admin_adjust_wallet({ p_user_id, p_delta, p_note })` — บวก/ลบ + บันทึก note
- คลิกชื่อ → ไป MemberDetail

---

### 6.5 MemberDetail (`/members/:id`)
**ไฟล์:** `src/pages/MemberDetail.jsx`

- ดูข้อมูลสมาชิกทั้งหมด + ยอด wallet + ประวัติ transaction

---

### 6.6 Affiliates (`/affiliates`)
**ไฟล์:** `src/pages/Affiliates.jsx`

- ระบบแนะนำเพื่อน — ดู referral tree, ยอด commission สะสม

---

### 6.7 LotteryMarkets (`/markets`)
**ไฟล์:** `src/pages/LotteryMarkets.jsx`

- จัดการ 21 ตลาดหวย: เปิด/ปิด, แก้ชื่อ, ตั้งค่า draw_time, อัปโหลดโลโก้

---

### 6.8 Results (`/results`)
**ไฟล์:** `src/pages/Results.jsx`

**Staging Pattern:**
1. ดึง `draw_schedules` วันนี้ (Bangkok time) + `lottery_results` 3 วันย้อนหลัง
2. Tab "รอออกผล" — แสดง schedules ที่ยังไม่มีผล
3. Admin กรอกผล: result_main, p_3top, p_3front, p_3bottom, p_2top, p_2bottom
4. กด Submit → `admin_set_result_and_settle({ p_schedule_id, ...results })`
5. RPC ทำงาน: บันทึกผล → ANNOUNCED → settle bets → จ่ายเงินผู้ถูก → SETTLED

Tab "ผลล่าสุด" — แสดง lottery_results ย้อนหลัง 3 วัน

---

### 6.9 BetsList (`/bets`)
**ไฟล์:** `src/pages/BetsList.jsx`

- ดึง `bets` join `profiles` + `lottery_markets` — paginate 30/หน้า
- Filter: PENDING / WON / LOST / CANCELLED / ALL
- ค้นหา: member_id, ชื่อ, เลขที่แทง
- แสดง bet_type เป็นภาษาไทย (3TOP→3 ตัวบน, 2BOTTOM→2 ตัวล่าง ฯลฯ)

> bet_type ในตาราง `bets` = **UPPERCASE** เสมอ (3TOP, 2BOTTOM, RUN_UP)

---

### 6.10 RestrictedNumbers (`/restricted`)
**ไฟล์:** `src/pages/RestrictedNumbers.jsx`

- ดึง `restricted_numbers` join `lottery_markets`
- เพิ่ม: `admin_add_restricted_number({ p_market_id, p_number, p_bet_type })`
- ลบ: `admin_remove_restricted_number({ p_id })`
- ป้อนหลายเลขพร้อมกัน (คั่นด้วย space หรือ comma)
- ประเภท: 3TOP, 3TODE, 3FRONT, 3BOTTOM, 2TOP, 2BOTTOM, RUN_UP, RUN_DOWN, 4TOP

---

### 6.11 WheelAdmin (`/wheel`)
**ไฟล์:** `src/pages/WheelAdmin.jsx`

- Preview วงล้อ SVG 8 ช่อง real-time
- แก้แต่ละช่อง: ชื่อรางวัล, จำนวนเงิน, สีพื้นหลัง (preset 8 สี)
- `admin_get_wheel_config` → prizes + settings
- `admin_update_wheel_prize` → บันทึกช่อง
- ตั้งค่า: ราคาหมุน (`lucky_wheel_cost`), จำกัด/วัน (`lucky_wheel_daily_limit`)
- อัปโหลด Banner: bucket `appearance` → key `lucky_wheel_banner_url`

---

### 6.12 InstantOverview (`/instant-overview`)
**ไฟล์:** `src/pages/InstantOverview.jsx`

- `admin_get_instant_stats` — KPI: ยอดเดิมพันทั้งหมด, จำนวนโพย, ยอดจ่าย
- `admin_get_instant_draws(limit=10)` — งวดล่าสุด 10 งวด
- `admin_get_instant_bets(limit=10)` — การแทงล่าสุด 10 รายการ
- กราฟสถิติ
- **Auto-refresh ทุก 30 วินาที**

---

### 6.13 InstantBetTypes (`/instant-bet-types`)
**ไฟล์:** `src/pages/InstantBetTypes.jsx`

- `admin_get_instant_bet_types` — ดึง 9 ประเภท
- แก้ inline: name, rate, min_digits, max_digits
- `admin_update_instant_bet_type({ p_id, p_name, p_rate, p_min_digits, p_max_digits })`
- Toggle: `admin_toggle_instant_bet_type({ p_id })`

**9 ประเภท (ค่าปัจจุบันใน DB):**

| code | ชื่อ | rate | checkWin |
|---|---|---|---|
| 2top | 2 ตัวบน | 90 | == substring(result_6d, 5, 2) |
| 2bottom | 2 ตัวล่าง | 90 | == substring(result_6d, 5, 2) |
| 3top | 3 ตัวบน | 900 | == substring(result_6d, 4, 3) |
| 3toad | 3 โต๊ด | 150 | sort(numbers) == sort(substr 4,3) |
| 3front | 3 หน้า | 450 | == substring(result_6d, 1, 3) |
| 3back | 3 ท้าย | 450 | == substring(result_6d, 4, 3) |
| 6straight | 6 ตัวตรง | 100000 | == result_6d ทั้ง 6 หลัก |
| pin_top | ปักหลักบน | **3.2** | ตำแหน่ง h(4)/t(5)/u(6) |
| pin_bottom | ปักหลักล่าง | **4.2** | ตำแหน่ง t(5)/u(6) |

> code = **lowercase** เสมอ ทั้งใน instant_bet_types และ instant_bets

---

### 6.14 InstantDraws (`/instant-draws`)
**ไฟล์:** `src/pages/InstantDraws.jsx`

- `admin_get_instant_draws({ p_limit, p_offset })` — paginate 50/หน้า
- Filter: สถานะ (all / PENDING / SETTLED) + ค้นหา draw_id หรือ result_6d
- แสดง: draw_id, result_6d, สถานะ, จำนวนโพย, ยอดเดิมพัน, ยอดจ่าย
- Export CSV

---

### 6.15 InstantBets (`/instant-bets`)
**ไฟล์:** `src/pages/InstantBets.jsx`

- `admin_get_instant_bets({ p_limit, p_offset, p_draw_id })` — paginate 50/หน้า
- Filter: สถานะ (all / PENDING / WIN / LOSE / CANCELLED) + ค้นหาเบอร์โทร/เลข
- กรอง draw_id เฉพาะงวดที่ต้องการ
- Export CSV

---

### 6.16 InstantResults (`/instant-results`)
**ไฟล์:** `src/pages/InstantResults.jsx`

- ดูผลรางวัลหวย 1 นาที ย้อนหลัง พร้อมสถิติ

---

### 6.17 InstantSettings (`/instant-settings`)
**ไฟล์:** `src/pages/InstantSettings.jsx`

- ตั้งค่าระบบหวย 1 นาที (เปิด/ปิดระบบ, จำกัดยอดเดิมพัน)

---

### 6.18 Settings (`/settings`)
**ไฟล์:** `src/pages/Settings.jsx`

บันทึกทุกค่าผ่าน `admin_upsert_setting({ p_key, p_value })`

| กลุ่ม | Keys |
|---|---|
| ระบบ | deposit_enabled, withdraw_enabled, maintenance_mode |
| ขีดจำกัด | min_deposit, min_withdraw, max_withdraw_per_request, max_daily_withdraw, min_bet, max_bet |
| ธนาคาร | company_bank_code (ใช้ BankSelector component) |
| Tracking Pixels | gtm_id, ga4_id, meta_pixel_id, tiktok_pixel_id |
| ช่องทางติดตาม | facebook_url, tiktok_url, telegram_url |
| Popup โฆษณา | popup_enabled, popup_title, popup_description, popup_image_url |

---

### 6.19 Appearance (`/appearance`)
**ไฟล์:** `src/pages/Appearance.jsx`

- ดึง/บันทึก: site_name, site_logo_url, site_favicon_url, site_primary_color, terms_html
- อัปโหลดรูป → Supabase Storage bucket `appearance`
- **Preview iPhone 15 iframe** — แสดง User App จริงใน iframe ขนาด iPhone 15
- บันทึกด้วย `admin_upsert_setting` ทุก key

---

### 6.20 Sliders (`/sliders`)
**ไฟล์:** `src/pages/Sliders.jsx`

- จัดการสไลเดอร์หน้าแรก User App
- เพิ่ม/แก้ไข/ลบ/เรียงลำดับ + อัปโหลดรูป

---

### 6.21 Promotions (`/promotions`)
**ไฟล์:** `src/pages/Promotions.jsx`

- ดึง `promotions` — insert/update/delete โดยตรง (ยังไม่มี RPC)
- Field สำคัญ: title, promo_code, type, bonus_rate, bonus_amount, min_deposit, max_withdrawal, turnover_multiplier, target_view, is_active
- **`allowed_game`:** `'all'` | `'main'` | `'instant'` — ควบคุมว่าโปรใช้ได้กับเกมไหน
- Toggle เปิด/ปิด per promotion

---

### 6.22 Articles (`/articles`)
**ไฟล์:** `src/pages/Articles.jsx`

- จัดการบทความ/ข่าวสำหรับหน้า User App

---

### 6.23 FeedManagement (`/feeds`)
**ไฟล์:** `src/pages/FeedManagement.jsx`

- Read-only ดูข้อมูล feed (ธนาคาร, ตลาดหวย)
- ไม่มีปุ่ม toggle ซ้ำซ้อน

---

### 6.24 Banks (`/banks`)
**ไฟล์:** `src/pages/Banks.jsx`

- จัดการรายการธนาคาร: code, name, image_url
- ข้อมูลนี้ใช้ใน BankBadge และ BankSelector ทุกที่

---

### 6.25 Admins (`/admins`)
**ไฟล์:** `src/pages/Admins.jsx`

- เฉพาะ **Super Admin** เพิ่ม/แก้ Admin ได้
- เพิ่ม Admin: ค้นหาจากสมาชิก หรือสร้างใหม่ด้วย temp client (ไม่กระทบ session ปัจจุบัน)
- กำหนด 15 Permissions ต่อคน:

| Key | ควบคุมหน้า |
|---|---|
| deposits | ฝากเงิน |
| withdrawals | ถอนเงิน |
| members | สมาชิก + Affiliates |
| bets | รายการโพย |
| markets | ตลาดหวย + ออกผล |
| instant | หวย 1 นาที (ทุกหน้า) |
| restricted | เลขอั้น |
| wheel | วงล้อโชคดี |
| settings | ตั้งค่า + Data Management |
| appearance | รูปลักษณ์ |
| banks | ธนาคาร |
| promotions | โปรโมชั่น |
| articles | บทความ |
| sliders | สไลเดอร์ |
| feeds | จัดการฟีด |

Role: `super_admin` (สิทธิ์ทุกอย่าง) หรือ `admin` (สิทธิ์ตาม permissions jsonb)

---

### 6.26 DataManagement (`/data-management`)
**ไฟล์:** `src/pages/DataManagement.jsx`

- แสดงจำนวน record เก่ากว่า 7 วัน ที่ cleanup ได้
- **Backup & Cleanup:** เรียก Edge Function `backup-and-cleanup`
  - Archive deposit/withdraw requests เก่า (APPROVED/REJECTED)
  - ล้าง notifications ที่อ่านแล้ว
  - แสดงผลสรุปจำนวนที่ทำ
- ดูไฟล์ backup จาก Supabase Storage bucket `backups`
- Download backup file

---

## 7. ระบบ Authentication

**ไฟล์:** `src/services/authService.js`, `src/AuthContext.jsx`

- Login ด้วย phone + PIN (Supabase Auth)
- `fetchAdminProfile(uid)` — ดึง profile จาก `profiles` ที่ `is_admin = true`
- `hasPermission(profile, perm)` — ตรวจ `profile.permissions[perm] === true` หรือ `role === 'super_admin'`
- Super Admin มีสิทธิ์ทุกอย่างโดยอัตโนมัติ
- `AdminGuard` — redirect `/login` ถ้า session หมด
- `PermGuard` — redirect `/` ถ้าไม่มีสิทธิ์

---

## 8. กลไกหวย 1 นาที (สำคัญมาก — อย่าสับสน)

### draw_id
```
draw_id = floor(Date.now() / 1000 / 60)        // JavaScript
draw_id = floor(extract(epoch from now()) / 60) // PostgreSQL
```
draw_id คือ BIGINT ไม่ใช่ UUID

### process_1min_lottery (cron ทุกนาที — Supabase pg_cron)
```
1. prev_id = current draw_id - 1
2. ถ้า prev_id ยัง PENDING → fn_settle_instant_draw(prev_id)
3. สุ่มเลข 6 หลัก (แต่ละหลัก 0-9 อิสระ)
4. INSERT instant_draws (draw_id, result_6d, result_2bottom, status='PENDING')
```

### fn_settle_instant_draw (migration 004 — ใช้อยู่ปัจจุบัน)
```
1. SELECT result_6d WHERE draw_id = p_draw_id
2. ถ้า result_6d IS NULL → RETURN 0
3. FOR EACH bet WHERE status = 'PENDING' (FOR UPDATE SKIP LOCKED):
   a. checkWin ตาม bet_type
   b. คำนวณ win_amount
   c. UPDATE instant_bets SET status=WIN/LOSE, winnings, settled_at
   d. ถ้า WIN → UPDATE wallets balance += win_amount, total_won += win_amount
4. UPDATE instant_draws SET status = 'SETTLED'   ← เพิ่มโดย migration 004
5. RETURN จำนวน bets ที่ settle
```

### สูตรคำนวณเงิน

**ทั่วไป (2top, 2bottom, 3top, 3toad, 3front, 3back, 6straight):**
```
win_amount = floor(amount × rate)
```

**ปักหลัก (pin_top, pin_bottom):**
```
totalPicks = hundreds.length + tens.length + units.length
amountPerPick = amount / totalPicks
win_amount = 0
ต่อตำแหน่งที่ถูก: win_amount += amountPerPick × rate
win_amount = floor(win_amount)
```

**ตัวอย่าง pin_bottom rate=4.2, ราคา 10 บาท/ตัว, เลือก 7 ตัว units:**
- User App ส่ง: `p_amount = 10 × 7 = 70`
- Supabase หัก: 70 บาท จาก wallet
- Settle: `amountPerPick = 70 / 7 = 10`
- ถ้าถูก 1 ตัว: `floor(10 × 4.2) = 42 บาท`

### checkWin Logic (ตาม Apps Script ต้นฉบับ)
```
result_6d = "ABCDEF" (6 หลัก, PostgreSQL substring นับจาก 1)

2top      → numbers == substring(result_6d, 5, 2)  // EF
2bottom   → numbers == substring(result_6d, 5, 2)  // EF
3top      → numbers == substring(result_6d, 4, 3)  // DEF
3toad     → sort(numbers) == sort(substring(result_6d, 4, 3))
3front    → numbers == substring(result_6d, 1, 3)  // ABC
3back     → numbers == substring(result_6d, 4, 3)  // DEF
6straight → numbers == result_6d                   // ABCDEF

pin_top:
  hundreds match → digit ที่ตำแหน่ง 4 (D)
  tens match     → digit ที่ตำแหน่ง 5 (E)
  units match    → digit ที่ตำแหน่ง 6 (F)

pin_bottom:
  tens match  → digit ที่ตำแหน่ง 5 (E)
  units match → digit ที่ตำแหน่ง 6 (F)
```

---

## 9. 21 ตลาดหวยหลัก

| Code | ชื่อ | เวลาออก | Source |
|---|---|---|---|
| STOCK_DOWJONES | หุ้นดาวน์โจนส์ | 02:30 จ-ศ | csv |
| NIKKEI_MORNING | หุ้นนิเคอิเช้า | 09:30 จ-ศ | csv |
| CHINA_MORNING | หุ้นจีนเช้า | 11:00 จ-ศ | csv |
| HANGSENG_MORNING | หุ้นฮั่งเส็งเช้า | 11:30 จ-ศ | csv |
| STOCK_KOREA | หุ้นเกาหลี | 13:30 จ-ศ | csv |
| STOCK_TAIWAN | หุ้นไต้หวัน | 13:30 จ-ศ | csv |
| CHINA_AFTERNOON | หุ้นจีนบ่าย | 14:30 จ-ศ | csv |
| NIKKEI_AFTERNOON | หุ้นนิเคอิบ่าย | 14:30 จ-ศ | csv |
| HANGSENG_AFTERNOON | หุ้นฮั่งเส็งบ่าย | 15:00 จ-ศ | csv |
| TH_GOV | หวยรัฐบาล | 15:30 วันที่ 1+16 | csv |
| STOCK_INDIA | หุ้นอินเดีย | 17:00 จ-ศ | csv |
| STOCK_SG | หุ้นสิงคโปร์ | 17:00 จ-ศ | csv |
| HANOI_SPECIAL | ฮานอยพิเศษ | 17:30 ทุกวัน | csv |
| HANOI | ฮานอยปกติ | 18:30 ทุกวัน | csv |
| MALAY | หวยมาเลย์ | 18:30 พ/ส/อา | web |
| HANOI_VIP | ฮานอย VIP | 19:30 ทุกวัน | csv |
| LAO | หวยลาว | 20:00 จ-ศ | web |
| STOCK_EGYPT | หุ้นอียิปต์ | 21:00 จ-ศ | csv |
| STOCK_RUSSIA | หุ้นรัสเซีย | 21:30 จ-ศ | csv |
| STOCK_GERMANY | หุ้นเยอรมัน | 22:00 จ-ศ | csv |
| STOCK_ENGLAND | หุ้นอังกฤษ | 22:30 จ-ศ | csv |

---

## 10. Database Schema หลัก

### profiles
`id(uuid), member_id, full_name, phone, bank_name, bank_account_number, bank_account_name, is_admin(bool), role(text), permissions(jsonb), status, vip_level, avatar_url, created_at`

### wallets
`id, user_id(uuid), balance(numeric), commission_balance, total_won, total_bets, updated_at, active_promo_id, turnover_required, turnover_completed, promo_max_withdrawal, promo_allowed_game`

### bets (หวยหลัก)
`id, user_id, draw_schedule_id(uuid), lottery_market_id, numbers, bet_type(UPPERCASE text), amount, payout_rate, payout_amount, status(PENDING/WON/LOST/CANCELLED), draw_date, created_at`

### instant_bets (หวย 1 นาที)
`id, user_id, draw_id(BIGINT), bet_type(lowercase), numbers(text or jsonb for pin), amount, payout_rate, status(PENDING/WIN/LOSE/CANCELLED), winnings, is_win(bool), settled_at, created_at`

### instant_draws
`draw_id(BIGINT), result_6d(text 6 chars), result_2bottom, status(PENDING/SETTLED), created_at, settled_at`

### instant_bet_types
`id, code(lowercase), name, rate(numeric), min_digits, max_digits, is_active(bool)`

### settings
Key-value store (key text, value text) — 60+ keys รวมถึง:
popup_enabled, popup_title, popup_description, popup_image_url,
gtm_id, ga4_id, meta_pixel_id, tiktok_pixel_id,
facebook_url, tiktok_url, telegram_url,
deposit_enabled, withdraw_enabled, maintenance_mode,
min_deposit, min_withdraw, max_withdraw_per_request, max_daily_withdraw,
min_bet, max_bet, company_bank_code,
site_name, site_primary_color, site_logo_url, site_favicon_url, terms_html,
lucky_wheel_cost, lucky_wheel_daily_limit, lucky_wheel_banner_url

### promotions
`id, title, promo_code, description, type, bonus_rate, bonus_amount, min_deposit, max_withdrawal, turnover_multiplier, allowed_game('all'|'main'|'instant'), is_active, created_at`

---

## 11. RPCs ทั้งหมด

### Admin — หวยหลัก + ทั่วไป
| RPC | พารามิเตอร์ | ใช้ทำอะไร |
|---|---|---|
| admin_dashboard_stats | — | KPI หลัก Dashboard |
| admin_dashboard_advanced_stats | — | top bettors, active members |
| get_markets_with_countdown | — | ตลาดพร้อม countdown |
| admin_approve_deposit | p_id, p_note | อนุมัติฝาก + เพิ่ม wallet |
| admin_reject_deposit | p_id, p_note | ปฏิเสธฝาก |
| admin_approve_withdrawal | p_id, p_note | อนุมัติถอน + หัก wallet |
| admin_reject_withdrawal | p_id, p_note | ปฏิเสธถอน + คืนเงิน |
| admin_update_member | p_user_id, p_patch | แก้ข้อมูลสมาชิก |
| admin_adjust_wallet | p_user_id, p_delta, p_note | ปรับยอดกระเป๋า |
| admin_set_result_and_settle | p_schedule_id, results... | บันทึกผลหวย + settle |
| admin_add_restricted_number | p_market_id, p_number, p_bet_type | เพิ่มเลขอั้น |
| admin_remove_restricted_number | p_id | ลบเลขอั้น |
| admin_get_wheel_config | — | ดึงค่าวงล้อ |
| admin_update_wheel_prize | p_slot, p_data | บันทึกรางวัลวงล้อ |
| admin_upsert_setting | p_key, p_value | บันทึก setting |

### Admin — หวย 1 นาที
| RPC | พารามิเตอร์ | ใช้ทำอะไร |
|---|---|---|
| admin_get_instant_stats | — | KPI ภาพรวม |
| admin_get_instant_draws | p_limit, p_offset | ดึงงวด |
| admin_get_instant_bets | p_limit, p_offset, p_draw_id | ดึงรายการแทง |
| admin_get_instant_bet_types | — | ดึง 9 ประเภท |
| admin_update_instant_bet_type | p_id, p_name, p_rate, p_min_digits, p_max_digits | แก้ประเภท |
| admin_toggle_instant_bet_type | p_id | เปิด/ปิดประเภท |

### User App
| RPC | ใช้ทำอะไร |
|---|---|
| fn_place_instant_bet | แทงหวย 1 นาที (amount = ราคาต่อตัว × picks สำหรับ pin) |
| fn_settle_instant_draw | settle + WIN/LOSE + SETTLED |
| process_1min_lottery | cron ทุกนาที |
| place_bet_securely | แทงหวยหลัก |
| submit_deposit_slip | ส่งสลิปฝาก |
| request_withdrawal_securely | ขอถอน |

---

## 12. Edge Functions (Supabase)

| Slug | เวอร์ชัน | หน้าที่ |
|---|---|---|
| fetch-lottery-results | v15 | ดึงผลหวยจากภายนอก (TH_GOV, หุ้น) |
| sync-lao-lottery | v8 | sync ผล LAO จาก web |
| sync-malay-lottery | v2 | sync ผล MALAY จาก web |
| backup-and-cleanup | - | archive + ล้างข้อมูลเก่า |

---

## 13. Migrations ที่ apply แล้ว (DB จริง)

| ไฟล์ | สิ่งที่ทำ | สถานะ |
|---|---|---|
| 001_admin_notifications.sql | ตาราง notifications + RPC | ✅ |
| 002_enable_realtime.sql | เปิด realtime สำหรับ notifications | ✅ |
| 003_update_instant_bet_types.sql | 9 ประเภท + แก้ rates pin_top=3.2 pin_bottom=4.2 + status WIN/LOSE | ✅ |
| 004_fix_settle_instant_draw_status.sql | เพิ่ม UPDATE status='SETTLED' ใน fn_settle_instant_draw | ✅ |

---

## 14. ความรู้สำคัญ — จุดที่เคยพลาด

| # | จุดที่ต้องระวัง | ค่าที่ถูกต้อง |
|---|---|---|
| 1 | bet_type หวยหลัก | **UPPERCASE** (3TOP, 2BOTTOM, RUN_UP) |
| 2 | bet_type/code หวย 1 นาที | **lowercase** (3top, pin_bottom) |
| 3 | instant_bets.draw_id | **BIGINT** ไม่ใช่ UUID |
| 4 | instant_bets.status | **PENDING/WIN/LOSE** ไม่ใช่ WON/LOST |
| 5 | pin bet amount จาก User App | ส่ง `amt × picks` ไม่ใช่ `amt` เดี่ยว |
| 6 | Admin URL | **th-lotto-admin-five.vercel.app** |
| 7 | LAO/MALAY เลข 4 หลัก | bot2 + top2 รวมกัน |
| 8 | Buddhist calendar | `th-TH-u-ca-buddhist` |
| 9 | Deploy | push GitHub → auto-deploy (ไม่ต้อง vercel CLI) |
| 10 | pin rates | pin_top=3.2, pin_bottom=4.2 |
| 11 | PostgreSQL substring | นับจาก 1 ไม่ใช่ 0 |

---

## 15. บั๊กที่แก้แล้วทั้งหมด

| # | บั๊ก | วิธีแก้ | Commit/Migration |
|---|---|---|---|
| 1 | settle JOIN column ผิด (t.bet_type ควรเป็น t.code) | แก้ใน fn_settle | migration 003 |
| 2 | settle_draw ไม่ match UPPERCASE | เพิ่ม UPPER() | migration 003 |
| 3 | HANOI_SPECIAL ทุกช่อง = 36 | Edge Function v14 | - |
| 4 | TH_GOV "กำลังโหลด..." เข้า DB | v15 กรอง isEmpty | - |
| 5 | NotificationPopup พัง | เพิ่ม useRef import | User App |
| 6 | draw_schedules ค้าง waiting | fn_close_stale_schedules | - |
| 7 | STOCK_RUSSIA ไม่มีงวด | fn_auto_generate_schedules | - |
| 8 | instant_bets status = WON/LOST | แก้ constraint + data + fn เป็น WIN/LOSE | 0a428f8 |
| 9 | instant_draws.status ไม่ SETTLED | เพิ่ม UPDATE ท้าย fn_settle | migration 004 / 1334381 |
| 10 | pin bet amount ผิด (ส่ง amt ไม่ × picks) | User App ส่ง amt×picks | 7262dbb |
| 11 | pin rates ผิด (9.9) | แก้เป็น 3.2/4.2 | migration 003 |
| 12 | InstantBetTypes.jsx field names ผิด | แก้ code/name/rate/min_digits/max_digits | 9e4772c |
| 13 | CHANGELOG มี duplicate sections | ลบ | f662aaa |

---

## 16. TODO (ยังไม่ได้ทำ)

| รายการ | ความสำคัญ |
|---|---|
| instant_draws.settled_at ไม่ถูก set | ต่ำ — ไม่กระทบ logic หลัก |
| package.json version ยังเป็น 1.3.0 | ต่ำ |

---

## 17. Workflow การทำงาน (บังคับ)

### เริ่ม Session ใหม่
```
1. อ่าน CLAUDE.md ทั้งหมด (ไฟล์นี้)
2. ดู CHANGELOG.md — รายการล่าสุด
3. ถ้าต้องตรวจ DB → execute_sql ก่อนตอบ
4. ห้ามตอบจากความจำ
```

### แก้โค้ด
```
1. Read ไฟล์จริงก่อน
2. แก้ไข
3. git add <files> && git commit -m "type: description"
4. git push -u origin master
5. อัปเดต CLAUDE.md + CHANGELOG.md + PROJECT_STATUS.md
6. git add docs && git commit -m "docs: update" && git push
```

### แก้ DB
```
1. execute_sql หรือ apply_migration
2. verify ด้วย SELECT query
3. บันทึกใน supabase/migrations/ + CHANGELOG.md
```

---

## 18. Dev Commands

```bash
# Local dev
cd /home/user/TH-LOTTO-Admin-push
npm run dev          # port 5174
npm run build        # ตรวจ build error

# Git — Admin App
git add <files>
git commit -m "type: description"
git push -u origin master

# หมายเหตุสำคัญ
# - push GitHub = auto-deploy Vercel (ไม่ต้องรัน vercel CLI)
# - ห้ามเก็บ token/key ในไฟล์ใดๆ
# - Token ที่ใช้แล้วต้อง revoke ทันที
```

---

*อัปเดตล่าสุด: 2026-06-07*
*เวอร์ชัน: v1.3.3*
*ตรวจสอบจาก: โค้ดจริงทุกไฟล์ + git log + supabase migrations*
