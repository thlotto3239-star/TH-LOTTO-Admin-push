# CLAUDE.md — Single Source of Truth สำหรับ AI ทุกตัว + คนทุกคน

> **🚨 บังคับ: อ่านไฟล์นี้ทั้งหมดก่อนทำงาน ห้ามข้าม ห้ามตอบจากความจำ**
> ตรวจจาก Supabase + Git + Vercel จริงเมื่อ: **2026-06-06 (อัปเดตล่าสุด)**

---

## 0. กฎเหล็ก 10 ข้อ (ละเมิดไม่ได้)

1. **ห้ามบอกว่า "เสร็จ/ออนไลน์" ถ้ายังไม่ verify จริง** — ตรวจ DB/git/Vercel ก่อนทุกครั้ง
2. **ก่อนแก้อะไร → snapshot ของเก่าก่อน** ไว้ที่ `memory/snapshots/`
3. **หลังแก้เสร็จ → อัปเดตไฟล์นี้ + `CHANGELOG.md` + `PROJECT_STATUS.md`**
4. **ทุก mutation จาก client → ผ่าน RPC เท่านั้น** (ห้าม .insert/.update/.delete)
5. **ห้ามเก็บ password / token / key ลงไฟล์ใดๆ**
6. **ก่อน git push → ถามผู้ใช้ + หลัง push → verify origin HEAD เลื่อนจริง**
7. **ห้ามตอบจากความจำเก่า** → query DB จริง / อ่านไฟล์จริงก่อน
8. **ภาษาไทย** สำหรับ UI + error messages + สื่อสารกับผู้ใช้
9. **ห้าม mix ระบบหวยหลัก กับ หวย 1 นาที** — คนละตาราง คนละ RPC
10. **ทดสอบก่อน deploy** — build ต้องผ่าน, query ต้อง verify

---

## 1. URLs + Repos (ตรวจจริง 2026-06-06)

| ส่วน | URL | GitHub | Branch |
|---|---|---|---|
| **User App** | https://th-lotto-app.vercel.app | thlotto3239-star/thlotto-premium | **main** |
| **Admin App** | https://th-lotto-admin-five.vercel.app | thlotto3239-star/TH-LOTTO-Admin-push | **master** |
| **Supabase** | project: **ygopnjbvccenryejqmlw** (Tokyo) | - | - |

> ⚠️ **ห้ามใช้** `th-lotto-admin.vercel.app` — เป็น project เก่าที่ไม่ auto-deploy แล้ว

---

## 2. สถานะ Git ล่าสุด (2026-06-06)

### Admin App — master
```
1334381  fix: fn_settle_instant_draw → SETTLED          ← ล่าสุด
e4094a7  docs: CHANGELOG + PROJECT_STATUS v1.3.1
0a428f8  fix: status WIN/LOSE ตาม Apps Script
9e4772c  fix: instant lottery rewrite ตาม Apps Script
f5a644a  docs: CLAUDE.md
364a755  feat: Appearance iframe + Dashboard             ← งานก่อนหน้า
827e075  feat: Promotions allowed_game
aecb82e  feat: Settings Tracking + Popup
fc023c9  feat: Settings BankSelector
f712656  fix: Dashboard mobile 2-column
f54bad9  feat: Dashboard feed TH
aab56d8  fix: FeedManagement
27bce6f  feat: Admin improvements v4.0.0
```

### User App — main
```
7262dbb  fix: pin bet amount = ราคาต่อตัว × picks     ← ล่าสุด (รอ push)
1a5a0e2  fix: UI rounded + ตัวหนังสือไม่ตก
99313e9  feat: Popup โฆษณาหน้าแรก
471ebbf  feat: BottomNav วงกลมวิ่งตาม tab
0c63251  fix: รัฐบาลบนสุดในย้อนหลัง
...
ddf2d0a  feat: Staging Pattern v4.0.0
```

> ⚠️ commit `7262dbb` ใน User App — **ยังไม่ได้ push** รอ credentials จากเครื่อง owner

---

## 3. สิ่งที่อัปเดตในรอบ 3–6 มิ.ย. 2026 (ครบทุกอย่าง)

### Admin App (TH-LOTTO-Admin-push)

#### ฟีเจอร์ใหม่ (งานของ owner — push ก่อน 5 มิ.ย.)
| ฟีเจอร์ | หน้า | รายละเอียด |
|---|---|---|
| Appearance | Appearance.jsx | iframe preview iPhone 15 จริง |
| Dashboard | Dashboard.jsx | แยก section "ใกล้ปิดรับ" + "ออกผลล่าสุดพร้อมเลข" |
| Promotions | Promotions.jsx | dropdown `allowed_game`: หวยหลัก / หวย 1 นาที / ทั้งหมด |
| Settings | Settings.jsx | Tracking Pixels (GTM, GA4, Meta, TikTok) |
| Settings | Settings.jsx | ช่องทางติดตาม (Facebook, TikTok, Telegram) |
| Settings | Settings.jsx | Popup โฆษณา (enable/title/desc/image) |
| Settings | Settings.jsx | BankSelector component แทน TextInput |
| Dashboard | Dashboard.jsx | feed แสดงข้อมูลธนาคาร/ตลาด TH |
| Dashboard | Dashboard.jsx | mobile cards 2 คอลัมน์ |
| FeedManagement | FeedManagement.jsx | read-only + ลบ toggle ซ้ำ |

#### แก้บั๊ก Instant Lottery (งานของ AI — 5–6 มิ.ย.)
| บั๊ก | ไฟล์ | รายละเอียด |
|---|---|---|
| status WON/LOST → WIN/LOSE | DB + InstantBets.jsx | ซิงค์ Apps Script |
| InstantBetTypes field names ผิด | InstantBetTypes.jsx | code/name/rate/min_digits/max_digits |
| InstantBets filter/display | InstantBets.jsx | uppercase WIN/LOSE |
| instant_draws.status ไม่ update | fn_settle_instant_draw | เพิ่ม UPDATE SET status='SETTLED' |

### User App (thlotto-premium)

#### ฟีเจอร์ใหม่ (งานของ owner — push แล้ว)
| ฟีเจอร์ | รายละเอียด |
|---|---|
| Popup โฆษณาหน้าแรก | 940×940, "ไม่แสดงอีก 24 ชม." ดึงจาก settings |
| BottomNav | วงกลมวิ่งตาม tab active |
| หน้าย้อนหลัง | รัฐบาลบนสุดเสมอ, จัดลำดับ LAO→HANOI→MALAY→หุ้น |
| TH_GOV design | การ์ดแบบเดียวกับหน้าหลัก + ชื่อ '3 ตัวหน้า'/'3 ตัวท้าย' |
| Buddhist calendar | พ.ศ. ทุกหน้า |
| UI fixes | rounded-xl, ตัวหนังสือไม่ตกบรรทัดมือถือ |
| NotificationPopup | fix useRef import |
| BankSelector | unified component |

#### แก้บั๊ก Instant Lottery (งานของ AI — 6 มิ.ย. **รอ push**)
| บั๊ก | ไฟล์ | รายละเอียด |
|---|---|---|
| pin bet amount ผิด | InstantLottery.jsx | `p_amount: amt` → `p_amount: isPinBet ? amt × picks : amt` |
| Modal placeholder | InstantLottery.jsx | "ระบุเงิน" → "ราคาต่อตัว (บาท)" |
| Modal แสดงยอดรวม | InstantLottery.jsx | แสดง "X ตัว × Y = ฿รวม" |

### Database (Supabase — มีผลทันที ไม่ต้อง deploy)
| รายการ | สถานะ |
|---|---|
| instant_bets status: PENDING/WIN/LOSE/CANCELLED | ✅ |
| instant_bet_types: pin_top=3.2, pin_bottom=4.2 | ✅ |
| fn_settle_instant_draw: WIN/LOSE + SETTLED | ✅ |
| fn_place_instant_bet: promo check + time lock | ✅ |
| process_1min_lottery: settle prev + draw current | ✅ |
| wallets: promo columns (active_promo_id, turnover_*) | ✅ |
| settings: 60 keys (popup, GTM, GA4, Meta, TikTok, social) | ✅ |
| promotions.allowed_game | ✅ |
| fn_auto_generate_schedules (30 วันล่วงหน้า) | ✅ |
| fn_close_stale_schedules | ✅ |
| cleanup-old-results-7d cron | ✅ |

---

## 4. สิ่งที่ยังค้าง (TODO)

| รายการ | วิธีแก้ |
|---|---|
| **User App pin fix ยังไม่ push** | `cd thlotto-premium && git push origin main` จากเครื่อง owner |
| **Admin App Vercel ยังไม่ deploy** | `npx vercel --prod --yes` จากเครื่อง owner |
| `instant_draws.settled_at` ไม่ถูก set | เล็กน้อย — ไม่กระทบ logic |

---

## 5. โปรเจคคืออะไร

**TH LOTTO** — ระบบแทงหวยออนไลน์ (Production จริง)
- หวยหลัก 21 ตลาด (รัฐบาล, ลาว, มาเลย์, ฮานอย×3, หุ้น×14)
- หวย 1 นาที (ออกผลทุก 1 นาที 24 ชม.)
- ฝาก/ถอน/วงล้อโชคดี/Affiliate
- **เก็บผลย้อนหลัง 7 วัน** → cron ลบทุกเที่ยงคืน

---

## 6. สองระบบหลัก (แยกกันสนิท — ใช้ wallets ร่วมเท่านั้น)

| | หวยหลัก 21 ตลาด | หวย 1 นาที |
|---|---|---|
| ตาราง | bets, lottery_results, draw_schedules | instant_bets, instant_draws, instant_bet_types |
| bet ID | draw_schedule_id (UUID) | draw_id (BIGINT = epoch/60) |
| ผลรางวัล | CSV + raakaadee → Staging Pattern | random ทุก 1 นาที |
| settle | settle_draw() | settle_instant_draw() → fn_settle_instant_draw() |
| **ใช้ร่วม** | **wallets** | **wallets** |

---

## 7. หวย 1 นาที — กลไกสำคัญ (ตาม Apps Script ต้นฉบับ)

### การคิดเงิน pin_top / pin_bottom
```
totalPicks = hundreds.length + tens.length + units.length
amountPerPick = betAmount / totalPicks
ถ้าถูก → winAmount += amountPerPick × rate (ต่อตำแหน่งที่ถูก)
floor(winAmount)
```

> **ตัวอย่าง:** pin_bottom, เลือก 7 ตัว units, ราคาต่อตัว 10 บาท
> - User App ส่ง: `p_amount = 10 × 7 = 70`
> - Supabase หัก: 70 บาท
> - ถ้าถูก 1 ตัว: `(70/7) × 4.2 = 42 บาท`

### instant_bet_types (9 ประเภท)
| code | rate | หมายเหตุ |
|---|---|---|
| 2top | 90 | 2 หลักท้าย |
| 2bottom | 90 | 2 หลักท้าย (เหมือน 2top) |
| 3top | 900 | 3 หลักท้าย |
| 3toad | 150 | 3 โต๊ด |
| 3front | 450 | 3 หลักหน้า |
| 3back | 450 | 3 หลักท้าย |
| 6straight | 100000 | 6 ตัวตรง |
| pin_top | **3.2** | ปักหลักบน (h/t/u) |
| pin_bottom | **4.2** | ปักหลักล่าง (t/u) |

### กลไก process_1min_lottery (ทุก 1 นาที)
```
1. ถ้างวดก่อน (prev_id) ยัง PENDING → settle_instant_draw(prev_id)
2. สุ่มเลข 6 หลัก (แต่ละหลักอิสระ)
3. INSERT instant_draws (draw_id, result_6d, result_2bottom, status='PENDING')
```

---

## 8. Staging Pattern (หวยหลัก)

```
CSV/raakaadee → fn_stage_result → STAGED
→ fn_publish_staged_results (ถึง draw_time) → ANNOUNCED
→ settle_draw → SETTLED (จ่ายเงิน)
```

---

## 9. 21 ตลาดหวย

| Code | ชื่อ | draw_time | source |
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

## 10. ฐานข้อมูล

### wallets columns
`id, user_id, balance, commission_balance, total_won, total_bets, updated_at, active_promo_id, turnover_required, turnover_completed, promo_max_withdrawal, promo_allowed_game`

### settings: 60 keys
popup_enabled, popup_title, popup_description, popup_image_url, gtm_id, ga4_id, meta_pixel_id, tiktok_pixel_id, facebook_url, tiktok_url, telegram_url, deposit_enabled, withdraw_enabled, maintenance_mode, min_deposit, min_withdraw, max_withdraw_per_request, max_daily_withdraw, min_bet, max_bet, company_bank_code, site_name, site_primary_color ...

### promotions: มี allowed_game ('all'|'main'|'instant')

---

## 11. RPCs สำคัญ

### User App
| RPC | ใช้ทำอะไร |
|---|---|
| fn_place_instant_bet(draw_id, type, numbers, amount) | แทงหวย 1 นาที — amount = ราคาต่อตัว × picks |
| fn_settle_instant_draw(draw_id) | settle + WIN/LOSE + SETTLED |
| process_1min_lottery() | cron ทุกนาที |
| fn_get_instant_result / fn_get_instant_popup | ดูผล |
| place_bet_securely | หวยหลัก |
| submit_deposit_slip | ฝาก |
| request_withdrawal_securely | ถอน |

### Admin
admin_set_result_and_settle, admin_approve/reject_deposit, admin_approve/reject_withdraw, admin_update_member, admin_adjust_wallet, admin_upsert_setting, admin_get/update/toggle_instant_bet_type

---

## 12. Edge Functions (12 ตัว)

| Slug | Version |
|---|---|
| fetch-lottery-results | v15 |
| sync-lao-lottery | v8 |
| sync-malay-lottery | v2 |

---

## 13. ความรู้สำคัญ (เคยพลาด)

- **bets.bet_type = UPPERCASE** (2TOP) / **instant_bet_types.code = lowercase** (2top)
- **instant_bets.draw_id = BIGINT** (epoch/60) ไม่ใช่ UUID
- **instant_bets.status**: PENDING/WIN/LOSE (ไม่ใช่ WON/LOST)
- **pin amount ที่ส่งจาก User App = ราคาต่อตัว × totalPicks** (ไม่ใช่ amount เดียว)
- **LAO/MALAY เลข 4 หลัก** = bot2 + top2
- **Buddhist calendar** ใช้ `th-TH-u-ca-buddhist` ทุกหน้า
- **Admin URL** = `th-lotto-admin-five.vercel.app` (ไม่ใช่ th-lotto-admin)

---

## 14. บั๊กที่เคยพบและแก้แล้ว

| # | บั๊ก | แก้ไข |
|---|---|---|
| 1 | settle_instant_draw JOIN ผิด column | แก้ `t.bet_type` → `t.code` |
| 2 | settle_draw ไม่ match | แก้เป็น UPPER() |
| 3 | HANOI_SPECIAL ทุกช่อง = 36 | v14 แสดงตามจริง |
| 4 | TH_GOV "กำลังโหลด..." เข้า DB | v15 กรอง isEmpty |
| 5 | NotificationPopup พัง | เพิ่ม useRef import |
| 6 | AI claim "push สำเร็จ" ทั้งที่ไม่ verify | กฎข้อ 6 |
| 7 | draw_schedules ค้าง waiting | fn_close_stale_schedules |
| 8 | STOCK_RUSSIA ไม่มีงวด | fn_auto_generate_schedules |
| 9 | instant_bets status WON/LOST (ผิด) | แก้เป็น WIN/LOSE |
| 10 | instant_draws.status ไม่ update SETTLED | เพิ่มใน fn_settle_instant_draw |
| 11 | pin bet amount หาร totalPicks แต่ App ส่ง total | แก้ User App ส่ง amt×picks |
| 12 | instant_bet_types rate ผิด (9.9) | แก้เป็น pin_top=3.2, pin_bottom=4.2 |

---

## 15. Workflow การทำงาน (บังคับ)

### เมื่อเริ่มเซสชันใหม่
```
1. อ่าน CLAUDE.md (ไฟล์นี้) ทั้งหมด
2. อ่าน CHANGELOG.md ล่าสุด
3. ตรวจ DB จริงผ่าน execute_sql ก่อนแก้
4. ห้ามตอบจากความจำเก่า
```

### เมื่อแก้โค้ด
```
1. อ่านไฟล์จริงก่อน
2. แก้ไข
3. commit + push
4. อัปเดต CLAUDE.md + CHANGELOG.md + PROJECT_STATUS.md
5. commit + push docs
```

### เมื่อแก้ DB
```
1. execute_sql หรือ apply_migration
2. มีผลทันที — verify ด้วย query
3. บันทึกใน migration file + CHANGELOG.md
```

---

## 16. Dev Commands

```bash
# Admin App
cd TH-LOTTO-Projects/TH-LOTTO-Admin-push
npm run dev -- --port 5174
npm run build
git push origin master
npx vercel --prod --yes   # deploy Admin

# User App
cd TH-LOTTO-Projects/thlotto-premium
npm run dev               # port 5173
git push origin main      # Vercel auto-deploy
```

---

*อัปเดตล่าสุด: 2026-06-06*
*AI ที่ไม่อ่านไฟล์นี้ก่อนทำงาน = ละเมิดกฎข้อ 0*
