# TH LOTTO — เอกสารภาพรวมระบบทั้งหมด

> ตรวจสอบจากโค้ดจริง | อัปเดต: 2026-06-07 | เวอร์ชัน v1.3.4

---

## ภาพรวม

ระบบ TH LOTTO ประกอบด้วย **2 แอปพลิเคชัน** ที่แยกกัน แต่ใช้ **Supabase DB เดียวกัน**

| | User App | Admin Panel |
|---|---|---|
| **URL** | https://th-lotto-app.vercel.app | https://th-lotto-admin-five.vercel.app |
| **GitHub** | thlotto-premium (main) | TH-LOTTO-Admin-push (master) |
| **ผู้ใช้** | ลูกค้า / สมาชิก | ผู้ดูแลระบบ |
| **Framework** | React 19 + Vite 8 + Tailwind 4 | React 19 + Vite 6 + Tailwind 3 |
| **Database** | Supabase ygopnjbvccenryejqmlw (Tokyo) | เดียวกัน |

---

# ส่วนที่ 1 — USER APP (หน้าผู้ใช้)

## 1.1 ระบบสมาชิก

### สมัครสมาชิก (`/register`)
- กรอกชื่อ, เบอร์โทร, PIN 6 หลัก, ธนาคาร, เลขบัญชี
- รองรับ referral code (`?ref=member_id`) — ระบุผู้แนะนำ
- หน้า RegistrationSuccess แสดง member_id ที่ได้รับ

### เข้าสู่ระบบ (`/login`)
- ใช้เบอร์โทร + PIN
- ลืม PIN → `/forgot-password`

### โปรไฟล์ (`/profile`)
- แสดง member_id, ชื่อ, ระดับ VIP
- สถิติ: จำนวนโพย, ยอดรวมที่ถูกรางวัล, จำนวนเพื่อนที่แนะนำ, ยอด commission
- Copy link แนะนำเพื่อน
- เมนูลิงก์: แก้ไขโปรไฟล์, บัญชีธนาคาร, เปลี่ยน PIN, ออกจากระบบ

### แก้ไขโปรไฟล์ (`/edit-profile`)
- แก้ชื่อ, ที่อยู่, อีเมล

### บัญชีธนาคาร (`/bank-account`)
- แก้ไขธนาคาร, เลขบัญชี, ชื่อบัญชี

### เปลี่ยน PIN (`/change-password`)
- ยืนยัน PIN เก่า → ตั้ง PIN ใหม่

---

## 1.2 กระเป๋าเงิน

### กระเป๋าหลัก (`/wallet`)
- แสดงยอดเงินคงเหลือ + commission balance
- ประวัติ transaction 10 รายการล่าสุด
- ปุ่มด่วน: ฝากเงิน, ถอนเงิน, โปรโมชั่น
- แสดงโปรโมชั่นที่ใช้งานได้

### ฝากเงิน (`/deposit`)
- เลือกจำนวน (quick: 100/500/1000/5000) หรือกรอกเอง
- รองรับ promo code (ถ้ามา จาก `?promo=CODE`)
- แสดงข้อมูลบัญชีบริษัทพร้อม QR Code (`/qr-payment`)
- อัปโหลดสลิป (`/upload-slip`) → RPC `submit_deposit_slip`
- หน้า DepositSuccess แจ้งว่ารอแอดมินอนุมัติ

### ถอนเงิน (`/withdrawal`)
- กรอกจำนวนที่ต้องการถอน
- แสดงบัญชีปลายทางของผู้ใช้
- ยืนยัน (`/withdrawal-confirm`) → RPC `request_withdrawal_securely`
- ตรวจ: ยอดขั้นต่ำ, ยอดสูงสุด/วัน, turnover ครบหรือยัง

### ประวัติธุรกรรม (`/transactions`)
- รายการทุกประเภท: DEPOSIT, WITHDRAW, BET, WIN, PAYOUT, COMMISSION
- เรียงล่าสุดก่อน

---

## 1.3 หน้าแรก (`/home`)

ดึงข้อมูลพร้อมกัน:
- **Banner Slider** — สไลด์รูป จาก `sliders` table
- **ผลหวยรัฐบาลล่าสุด** — ดึงจาก `lottery_results`
- **ตลาดหวยที่เปิดรับแทง** — `get_markets_with_countdown` เรียงตามเวลาปิดรับ
- **ตลาด Popular** — ตลาดที่ show_in_popular = true
- **countdown** ต่อตลาด — นับถอยหลังแบบ real-time
- **โปรโมชั่น** — slider โปรจาก `promotions`
- **บทความ** — 3 บทความล่าสุด
- **Popup โฆษณา** — แสดงครั้งแรกที่เปิดแอป (ถ้า popup_enabled = true)
- **หวย 1 นาที** — แบนเนอร์/ปุ่มเข้าเล่น ถ้าระบบเปิดอยู่

---

## 1.4 หวยหลัก (21 ตลาด)

### รายการตลาด (`/lottery-list`)
- แสดงตลาดทั้งหมดที่เปิดอยู่
- countdown ปิดรับ real-time ต่อตลาด
- กดเข้าหน้าแทง

### แทงหวย (`/betting?draw=ID`)
- เลือกประเภทการแทง: 4 ตัวบน, 3 ตัวบน, 3 ตัวโต๊ด, 3 ตัวหน้า, 3 ตัวล่าง, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง
- กดปุ่มเลขบนแป้น หรือพิมพ์ตรง
- ตั้งราคาต่อใบ
- ใส่ตะกร้า (cart) ก่อนยืนยัน
- countdown ปิดรับแบบ real-time
- Live stream ถ้ามี URL
- ยืนยันซื้อ → RPC `place_bet_securely`
- แสดงอัตราจ่าย: 4TOP=6000, 3TOP=900, 3TODE=150, 2TOP=95, 2BOTTOM=95 ฯลฯ

### ประวัติโพย (`/bet-history`)
- แสดงโพยของผู้ใช้แยกตาม tab: ทั้งหมด / รอผล / ถูกรางวัล / ไม่ถูก
- กรองตามวันที่
- สรุปยอดเดิมพัน/ยอดที่ได้

### ผลรางวัล (`/results`)
- ผลหวยทุกตลาด ย้อนหลัง
- หวยรัฐบาลอยู่บนสุด

---

## 1.5 หวย 1 นาที (`/instant-lottery`)

ระบบหวยที่ออกผลทุก 1 นาที อัตโนมัติ

**ประเภทการแทง 9 ประเภท:**

| ประเภท | ชื่อแสดง | จำนวนหลัก | อัตราจ่าย |
|---|---|---|---|
| 2top | 2 ตัว | 2 หลัก | 90 |
| 2bottom | 2 ตัวราง | 2 หลัก | 90 |
| 3top | 3 ตัวหน้า | 3 หลัก | 900 |
| 3toad | 3 ตัวโต๊ด | 3 หลัก | 150 |
| 3front | 3 ตัวหน้า | 3 หลัก | 450 |
| 3back | 3 ตัวท้าย | 3 หลัก | 450 |
| 6straight | 6 ตัวตรง | 6 หลัก | 100,000 |
| pin_top | ปักหลักบน | เลือกตำแหน่ง | 3.2 |
| pin_bottom | ปักหลักล่าง | เลือกตำแหน่ง | 4.2 |

**การทำงาน:**
- Countdown 60 วินาทีต่องวด
- กดแป้นตัวเลข → popup ใส่ราคา → ยืนยัน
- **pin_top/pin_bottom:** เลือกตำแหน่ง (ร้อย/สิบ/หน่วย) + เลขแต่ละตำแหน่ง → ระบุ "ราคาต่อตัว" → ระบบคิด `amount = ราคาต่อตัว × จำนวนตัวที่เลือก`
- แสดงผลงวดก่อนหน้าทันทีหลังออกรางวัล
- ประวัติการแทง 10 รายการล่าสุด
- ยืนยันซื้อ → RPC `fn_place_instant_bet`

**ผลรางวัล:** ออกอัตโนมัติทุกนาที, เลข 6 หลักสุ่ม — ตรวจสอบ substring ตามตำแหน่ง

---

## 1.6 วงล้อโชคดี (`/lucky-wheel`)

- วงล้อ SVG 8 ช่อง แสดงรางวัลจาก DB
- กดหมุน → RPC `fn_spin_lucky_wheel` หักเครดิต
- แสดงผลด้วย animation
- มี LED ring กระพริบขณะหมุน
- จำกัดจำนวนครั้ง/วัน (ตามค่า `lucky_wheel_daily_limit`)
- ราคาหมุน (ตามค่า `lucky_wheel_cost`)
- ช่องรางวัล: เงินสด หรือ "โชค" (ไม่ได้รางวัล)

---

## 1.7 โปรโมชั่น (`/promotions`)

- แสดงโปรโมชั่นที่ is_active = true
- กดรับโปร → ไปหน้าฝากพร้อม promo code
- ประเภทโปร: general, deposit_bonus, cashback ฯลฯ
- `allowed_game`: all / main / instant — ระบุว่าโปรใช้กับเกมไหน
- แสดง: bonus_rate, turnover, เงื่อนไขสูงสุดถอน

---

## 1.8 แนะนำเพื่อน (`/affiliate`)

- แสดง referral link ส่วนตัว
- รายชื่อเพื่อนที่แนะนำ (สูงสุด 10 คน)
- ประวัติ commission ที่ได้รับ
- โอน commission balance เข้า wallet หลัก → RPC `transfer_commission`

---

## 1.9 เนื้อหา

### บทความ (`/articles`, `/articles/:id`)
- รายการบทความที่ is_published = true
- กดอ่านบทความเต็ม

### การแจ้งเตือน (`/notifications`)
- ประวัติ notification ทั้งหมด
- อ่านแล้ว/ยังไม่อ่าน

### ติดต่อเรา (`/support`)
- ช่องทางติดต่อจาก settings (Facebook, TikTok, Telegram)

### ข้อกำหนดและเงื่อนไข (`/terms`)
- แสดง terms_html จาก settings

---

## 1.10 Navigation

**BottomNav (5 ปุ่ม):**
- หน้าแรก (`/home`)
- หวย (`/lottery-list`)
- หวย 1 นาที (`/instant-lottery`)
- กระเป๋า (`/wallet`)
- โปรไฟล์ (`/profile`)

**AppHeader:**
- โลโก้, ยอดเงิน, ปุ่มการแจ้งเตือน

---

# ส่วนที่ 2 — ADMIN PANEL (หน้าผู้ดูแลระบบ)

## 2.1 ระบบ Login & สิทธิ์

- Login ด้วยเบอร์โทร + PIN
- **Super Admin:** เข้าได้ทุกหน้า ทำได้ทุกอย่าง
- **Admin:** เข้าได้เฉพาะหน้าที่ได้รับ permission (15 สิทธิ์)

**15 Permission:**
deposits, withdrawals, members, bets, markets, instant, restricted, wheel, settings, appearance, banks, promotions, articles, sliders, feeds

---

## 2.2 Dashboard (`/`)

ดึงข้อมูลพร้อมกัน ทุก 30 วินาที:
- **KPI 4 ตัว:** สมาชิกทั้งหมด, ยอดฝากวันนี้, ยอดถอนวันนี้, โพยรอผล
- **สถิติขั้นสูง:** สมาชิก active 7 วัน, top 10 bettors, อัตราถอน
- **กราฟ Bar Chart:** ยอดเงิน 7 วันย้อนหลัง (ฝาก/ถอน/แทง)
- **Feed รายการล่าสุด:** ฝาก/ถอน/โพย พร้อมโลโก้ธนาคาร
- **ตลาดใกล้ปิดรับ:** countdown + สถานะ
- **ผลล่าสุด:** เลขรางวัลพร้อมชื่อตลาด

---

## 2.3 การเงิน

### รายการฝากเงิน (`/deposits`)
- ดูรายการทั้งหมด | filter: PENDING / APPROVED / REJECTED
- ค้นหาด้วย member_id / เบอร์ / ชื่อ
- ดูสลิป preview ใน modal
- อนุมัติ → เพิ่มเงินเข้า wallet อัตโนมัติ
- ปฏิเสธ → พร้อมระบุเหตุผล
- Export CSV รองรับ Excel ไทย

### รายการถอนเงิน (`/withdrawals`)
- ดูรายการทั้งหมด | filter: PENDING / APPROVED / REJECTED
- Copy เลขบัญชี/ชื่อบัญชีปลายทาง
- อนุมัติ → หักเงินจาก wallet
- ปฏิเสธ → คืนเงินเข้า wallet อัตโนมัติ
- Export CSV

---

## 2.4 สมาชิก

### จัดการสมาชิก (`/members`)
- ดูสมาชิกทั้งหมด paginate 20/หน้า
- ค้นหา: member_id, เบอร์, ชื่อ
- แก้ไขข้อมูล: ชื่อ, เบอร์, ธนาคาร, สถานะ, VIP level
- ปรับยอดกระเป๋า: บวก/ลบ พร้อมบันทึกเหตุผล
- กดชื่อ → ดูรายละเอียดสมาชิก

### รายละเอียดสมาชิก (`/members/:id`)
- ข้อมูลสมาชิกทั้งหมด + ยอดกระเป๋า + ประวัติ transaction

### ระบบแนะนำเพื่อน (`/affiliates`)
- ดู referral network + ยอด commission สะสม

### ผู้ดูแลระบบ (`/admins`)
- Super Admin เท่านั้น: เพิ่ม/แก้ไข Admin
- กำหนด 15 permissions ต่อคน
- เพิ่มจากสมาชิกที่มีอยู่ หรือสร้างใหม่

---

## 2.5 หวยหลัก

### ตลาดหวย (`/markets`)
- 21 ตลาด: เปิด/ปิดแต่ละตลาด
- แก้ชื่อ, ตั้งเวลาออก, อัปโหลดโลโก้

### ออกผลรางวัล (`/results`)
- Tab "รอออกผล": แสดง schedules วันนี้ที่ยังไม่มีผล
- กรอก: result_main, 3 ตัวบน, 3 ตัวหน้า, 3 ตัวล่าง, 2 ตัวบน, 2 ตัวล่าง
- Submit → RPC settle bets → จ่ายเงินผู้ถูกอัตโนมัติ
- Tab "ผลล่าสุด": ย้อนหลัง 3 วัน

### รายการโพย (`/bets`)
- ดูโพยทั้งหมด paginate 30/หน้า
- Filter: PENDING / WON / LOST / CANCELLED
- ค้นหา: member_id, ชื่อ, เลขที่แทง

### เลขอั้น (`/restricted`)
- เพิ่ม/ลบเลขที่ไม่รับแทงต่อตลาด
- รองรับใส่หลายเลขพร้อมกัน
- ประเภท: 3TOP, 3TODE, 3FRONT, 3BOTTOM, 2TOP, 2BOTTOM, RUN_UP, RUN_DOWN, 4TOP

---

## 2.6 หวย 1 นาที

### ภาพรวม (`/instant-overview`)
- KPI: ยอดเดิมพันรวม, จำนวนโพย, ยอดจ่ายออก
- งวดล่าสุด 10 งวด + การแทงล่าสุด 10 รายการ
- Auto-refresh ทุก 30 วินาที

### ประเภทเดิมพัน (`/instant-bet-types`)
- แก้ไข 9 ประเภท: ชื่อ, อัตราจ่าย, จำนวนหลัก
- เปิด/ปิด per ประเภท

### งวดออกรางวัล (`/instant-draws`)
- ดูงวดทั้งหมด paginate 50/หน้า
- Filter: PENDING / SETTLED
- ค้นหาด้วย draw_id หรือเลขผล
- Export CSV

### รายการแทง (`/instant-bets`)
- ดูรายการแทงทั้งหมด paginate 50/หน้า
- Filter: PENDING / WIN / LOSE / CANCELLED
- กรองตาม draw_id
- Export CSV

### ผลรางวัล (`/instant-results`)
- ดูประวัติผลรางวัลย้อนหลัง

### ตั้งค่า (`/instant-settings`)
- เปิด/ปิดระบบหวย 1 นาที
- จำกัดยอดเดิมพันสูงสุด

---

## 2.7 เกม

### วงล้อโชคดี (`/wheel`)
- Preview วงล้อ SVG 8 ช่อง real-time
- แก้ชื่อรางวัล, จำนวนเงิน, สีต่อช่อง
- ตั้งค่า: ราคาหมุน, จำนวนครั้ง/วัน
- อัปโหลด Banner วงล้อ

---

## 2.8 คอนเทนต์

### สไลเดอร์ (`/sliders`)
- จัดการรูป banner หน้าแรก User App
- เพิ่ม/แก้/ลบ/เรียงลำดับ

### โปรโมชั่น (`/promotions`)
- เพิ่ม/แก้/ลบ โปรโมชั่น
- ตั้งค่า: ชื่อ, promo code, ประเภท, bonus, turnover, เกมที่ใช้ได้

### บทความ (`/articles`)
- จัดการบทความ/ข่าว

### จัดการฟีด (`/feeds`)
- ดูข้อมูล feed (ธนาคาร, ตลาด) — read-only

---

## 2.9 ระบบ

### ตั้งค่าระบบ (`/settings`)
บันทึกทุกค่าผ่าน `admin_upsert_setting`:
- เปิด/ปิด: ฝากเงิน, ถอนเงิน, maintenance mode
- ขีดจำกัด: ฝากขั้นต่ำ, ถอนขั้นต่ำ, ถอนสูงสุด/รายการ, ถอนสูงสุด/วัน, แทงขั้นต่ำ/สูงสุด
- บัญชีรับเงิน: BankSelector
- Tracking: GTM, GA4, Meta Pixel, TikTok Pixel
- ช่องทางติดต่อ: Facebook, TikTok, Telegram
- Popup โฆษณา: เปิด/ปิด, หัวข้อ, คำอธิบาย, รูป

### รูปลักษณ์ (`/appearance`)
- ชื่อเว็บ, โลโก้, favicon, สีหลัก
- Terms & Conditions (HTML)
- อัปโหลดรูป → Supabase Storage bucket `appearance`
- Preview iPhone 15 iframe (User App จริง)

### ธนาคาร (`/banks`)
- จัดการรายการธนาคาร: code, ชื่อ, โลโก้
- ใช้ใน BankBadge และ BankSelector ทุกที่

### Backup & ข้อมูล (`/data-management`)
- แสดงจำนวน record เก่าที่ cleanup ได้ (>7 วัน)
- Backup & Cleanup → Edge Function `backup-and-cleanup`
- ดาวน์โหลด backup files

---

# ส่วนที่ 3 — Database & Backend

## 3.1 ตารางหลัก

| ตาราง | ใช้โดย | หน้าที่ |
|---|---|---|
| profiles | ทั้งสอง | ข้อมูลสมาชิก + permissions |
| wallets | ทั้งสอง | ยอดเงิน + commission + turnover |
| bets | ทั้งสอง | โพยหวยหลัก |
| lottery_results | ทั้งสอง | ผลรางวัลหวยหลัก |
| draw_schedules | ทั้งสอง | กำหนดการออกรางวัล |
| lottery_markets | ทั้งสอง | 21 ตลาดหวย |
| instant_bets | ทั้งสอง | โพยหวย 1 นาที |
| instant_draws | ทั้งสอง | งวดหวย 1 นาที |
| instant_bet_types | Admin | ประเภทเดิมพัน 9 ประเภท |
| deposit_requests | ทั้งสอง | คำขอฝากเงิน |
| withdraw_requests | ทั้งสอง | คำขอถอนเงิน |
| transactions | ทั้งสอง | ประวัติการเงินทุกประเภท |
| settings | ทั้งสอง | ค่าตั้งค่าระบบ (key-value) |
| promotions | ทั้งสอง | โปรโมชั่น |
| sliders | ทั้งสอง | รูป banner |
| articles | ทั้งสอง | บทความ |
| banks | ทั้งสอง | รายการธนาคาร |
| notifications | Admin | การแจ้งเตือนแอดมิน |
| restricted_numbers | Admin | เลขอั้น |

## 3.2 Edge Functions

| Function | หน้าที่ |
|---|---|
| fetch-lottery-results (v15) | ดึงผลหวยจากแหล่งภายนอก |
| sync-lao-lottery (v8) | sync ผลหวยลาว |
| sync-malay-lottery (v2) | sync ผลมาเลย์ |
| backup-and-cleanup | archive + ล้างข้อมูลเก่า |

## 3.3 Cron Jobs (pg_cron)

| Job | รัน | หน้าที่ |
|---|---|---|
| process_1min_lottery | ทุกนาที | settle งวดก่อนหน้า + สร้างงวดใหม่ |
| fn_close_stale_schedules | ทุกชั่วโมง | ปิด schedule ที่เลยเวลา |
| fn_auto_generate_schedules | ทุกวัน | สร้าง schedule ล่วงหน้า |

---

# ส่วนที่ 4 — สรุปฟีเจอร์ทั้งหมด

## User App — 30 หน้า
| หน้า | Path |
|---|---|
| Login | /login |
| Register | /register |
| Forgot Password | /forgot-password |
| Home | /home |
| Lottery List | /lottery-list |
| Betting | /betting |
| Bet History | /bet-history |
| Results | /results |
| Instant Lottery | /instant-lottery |
| Wallet | /wallet |
| Deposit | /deposit |
| QR Payment | /qr-payment |
| Upload Slip | /upload-slip |
| Deposit Success | /deposit-success |
| Withdrawal | /withdrawal |
| Withdrawal Confirm | /withdrawal-confirm |
| Transactions | /transactions |
| Lucky Wheel | /lucky-wheel |
| Promotions | /promotions |
| Affiliate | /affiliate |
| Profile | /profile |
| Edit Profile | /edit-profile |
| Bank Account | /bank-account |
| Change Password | /change-password |
| Notifications | /notifications |
| Support | /support |
| Articles | /articles |
| Article Detail | /articles/:id |
| Terms | /terms |
| Processing | /processing |

## Admin Panel — 26 หน้า
| หน้า | Path | สิทธิ์ |
|---|---|---|
| Dashboard | / | ทุกคน |
| Deposits | /deposits | deposits |
| Withdrawals | /withdrawals | withdrawals |
| Members | /members | members |
| Member Detail | /members/:id | members |
| Affiliates | /affiliates | members |
| Lottery Markets | /markets | markets |
| Results | /results | markets |
| Bets List | /bets | bets |
| Restricted Numbers | /restricted | restricted |
| Wheel Admin | /wheel | wheel |
| Instant Overview | /instant-overview | instant |
| Instant Bet Types | /instant-bet-types | instant |
| Instant Draws | /instant-draws | instant |
| Instant Bets | /instant-bets | instant |
| Instant Results | /instant-results | instant |
| Instant Settings | /instant-settings | instant |
| Settings | /settings | settings |
| Appearance | /appearance | appearance |
| Sliders | /sliders | sliders |
| Promotions | /promotions | promotions |
| Articles | /articles | articles |
| Feed Management | /feeds | feeds |
| Banks | /banks | banks |
| Admins | /admins | super_admin |
| Data Management | /data-management | settings |

---

*ตรวจสอบจากโค้ดจริง: thlotto-premium + TH-LOTTO-Admin-push*
*อัปเดต: 2026-06-07 | v1.3.4*
