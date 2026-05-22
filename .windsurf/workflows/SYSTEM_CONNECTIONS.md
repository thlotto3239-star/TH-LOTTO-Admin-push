# SYSTEM CONNECTIONS - การเชื่อมต่อระบบ TH-LOTTO

## 📋 ภาพรวมการเชื่อมต่อระบบ

เอกสารนี้อธิบายการเชื่อมต่อทั้งหมดในระบบ TH-LOTTO ระหว่าง User App, Admin Panel, Supabase, Vercel และ GitHub

---

## 🔗 การเชื่อมต่อหลัก

### 1. User App (หน้าผู้ใช้)
- **GitHub:** https://github.com/thlotto3239-star/thlotto-premium
- **Branch:** main
- **Live URL:** https://th-lotto-app.vercel.app
- **Vercel Project:** th-lotto-app (prj_tJriP88kWcWOSUQOo8E0UrwSJb7v)
- **Local Path:** D:\TH-LOTTO-Projects\thlotto-premium
- **Tech Stack:** React 19, Vite 8, TailwindCSS v4, React Router v7

### 2. Admin Panel (หน้าแอดมิน)
- **GitHub:** https://github.com/thlotto3239-star/TH-LOTTO-Admin-push
- **Branch:** master
- **Live URL:** https://th-lotto-admin.vercel.app
- **Vercel Project:** th-lotto-admin (prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM)
- **Local Path:** D:\TH-LOTTO-Projects\TH-LOTTO-Admin-push
- **Tech Stack:** React 19, Vite 8, TailwindCSS, React Router DOM, Recharts

### 3. Supabase (Backend ร่วมกัน)
- **Database:** PostgreSQL
- **Auth:** Phone + 4-digit PIN (SHA256)
- **Storage:** สำหรับไฟล์ต่างๆ
- **Edge Functions:** สำหรับ automation
- **Realtime:** สำหรับ live updates
- **API URL:** (ดูจาก Supabase Dashboard)

---

## 🔄 การทำงานร่วมกัน

### User App ↔ Supabase
- **Authentication:** ล็อกอินด้วยเบอร์โทรศัพท์ + PIN
- **Real-time:** รับข้อมูลสดจาก Supabase Realtime
- **RPC Functions:** เรียกใช้ฟังก์ชันจาก Supabase
- **Storage:** อัพโหลด/ดาวน์โหลดไฟล์

### Admin Panel ↔ Supabase
- **Authentication:** ล็อกอินด้วยเบอร์โทรศัพท์ + PIN (admin role)
- **Management:** จัดการข้อมูลทั้งหมด
- **RPC Functions:** เรียกใช้ฟังก์ชัน admin เฉพาะ
- **Data Export:** ส่งออกข้อมูลเป็น CSV

### User App ↔ Admin Panel
- **ไม่มีการเชื่อมต่อโดยตรง**
- **ทั้ง 2 ฝั่งเชื่อมต่อกับ Supabase เดียวกัน**
- **ข้อมูล sync ผ่าน Supabase**

### GitHub ↔ Vercel
- **User App:** push ไป GitHub → Vercel auto-deploy
- **Admin Panel:** push ไป GitHub → Vercel auto-deploy
- **Manual Deploy:** ใช้ `npx vercel --prod --yes`

---

## 🚀 ขั้นตอนการพัฒนา

### 1. อ่านเอกสารก่อนทำทุกอย่าง (บังคับ)
- PROJECT_GUIDE.md (ทั้ง 2 โปรเจค)
- AI_WORKFLOW.md
- PROJECT_PROTECTION.md
- PROJECT_STATUS.md (ทั้ง 2 โปรเจค)
- DEPLOY_MAP.md

### 2. ตรวจสอบสถานะล่าสุด (บังคับ)
```bash
# User App
cd d:/TH-LOTTO-Projects/thlotto-premium
git status
git diff HEAD
git log --oneline -5

# Admin Panel
cd d:/TH-LOTTO-Projects/TH-LOTTO-Admin-push
git status
git diff HEAD
git log --oneline -5
```

### 3. ตรวจสอบ Vercel Project (บังคับ)
```bash
# User App
cd d:/TH-LOTTO-Projects/thlotto-premium
cat .vercel/project.json
# ตรวจสอบว่า projectName = "th-lotto-app"

# Admin Panel
cd d:/TH-LOTTO-Projects/TH-LOTTO-Admin-push
cat .vercel/project.json
# ตรวจสอบว่า projectName = "th-lotto-admin"
```

### 4. วิเคราะห์และทำความเข้าใจ (บังคับ)
- อ่าน code ที่เกี่ยวข้องทั้งหมด
- วิเคราะห์ flow การทำงาน
- ตรวจสอบจุดเชื่อมต่อทั้งหมด
- เข้าใจระบบทั้งหมดก่อนแก้ไข
- ห้ามเดาหรือคิดแทน

### 5. รัน workflow /checkpoint (บังคับ)
```bash
git add -A
git commit -m "checkpoint: before work"
git tag -a checkpoint-YYYYMMDD-HHMMSS -m "Safety checkpoint"
git push origin <branch>
git push --tags
```

### 6. ทำงานตามที่ต้องการ
- ใช้ฟังก์ชั่นที่มีอยู่แล้วเท่านั้น
- ตรวจสอบ field name จาก RPC/DB ก่อนเรียก
- ทำงานตามที่ต้องการ

### 7. Commit + Push + Deploy
```bash
git add -A
git commit -m "describe changes clearly"
git push origin <branch>
npx vercel --prod --yes
```

### 8. อัพเดทเอกสาร
- CHANGELOG.md (เพิ่ม version ใหม่ด้านบน)
- PROJECT_STATUS.md (อัพเดท version + date)

### 9. Commit Docs + Push + Deploy
```bash
git add CHANGELOG.md PROJECT_STATUS.md
git commit -m "docs: update CHANGELOG and PROJECT_STATUS"
git push origin <branch>
npx vercel --prod --yes
```

---

## ⚠️ จุดที่ต้องระวัง

### 1. Branch Name
- **User App:** main (ไม่ใช่ master)
- **Admin Panel:** master (ไม่ใช่ main)
- ตรวจสอบ branch ก่อน commit + push

### 2. Vercel Project Name
- **User App:** th-lotto-app (มี dash)
- **Admin Panel:** th-lotto-admin (มี dash)
- ตรวจสอบ .vercel/project.json ก่อน deploy ทุกครั้ง

### 3. Field Name
- ตรวจสอบ field name จาก RPC/DB ก่อนเรียก
- อย่าสมมติ field name จาก frontend
- เคยมีปัญหา: bet_type vs type, rate vs payout_rate

### 4. Deploy Target
- **User App:** https://th-lotto-app.vercel.app
- **Admin Panel:** https://th-lotto-admin.vercel.app
- ห้าม deploy ไป domain อื่น

---

## 📊 สถาปัตยกรรมระบบ

```
┌─────────────────┐
│   User App      │
│  (React + Vite) │
└────────┬────────┘
         │
         │ Supabase Client
         │
┌────────▼────────┐
│   Supabase      │
│  (PostgreSQL)   │
│  - Auth         │
│  - Database     │
│  - Storage      │
│  - Edge Funcs   │
│  - Realtime     │
└────────┬────────┘
         │
         │ Supabase Client
         │
┌────────▼────────┐
│  Admin Panel    │
│  (React + Vite) │
└─────────────────┘

┌─────────────────┐
│   GitHub        │
│  - thlotto-     │
│    premium      │
│  - TH-LOTTO-    │
│    Admin-push   │
└────────┬────────┘
         │
         │ Git Push
         │
┌────────▼────────┐
│   Vercel        │
│  - th-lotto-app │
│  - th-lotto-    │
│    admin        │
└─────────────────┘
```

---

## 🔐 ความปลอดภัย

### Authentication
- **User App:** Phone + 4-digit PIN (SHA256)
- **Admin Panel:** Phone + 4-digit PIN (SHA256) + Role-based access

### Role-based Access
- **super_admin:** ทุกอย่าง
- **admin:** deposits, withdrawals, members, bets, markets, settings
- **staff:** deposits, withdrawals, members, bets

### Environment Variables
- **SUPABASE_URL:** URL ของ Supabase
- **SUPABASE_ANON_KEY:** Public key สำหรับ User App
- **SUPABASE_SERVICE_ROLE_KEY:** Service key สำหรับ Admin Panel
- ห้ามเขียน environment variables ใน code

---

## 📞 ติดต่อ

- ผู้ดูแลระบบ: 0622306037
- GitHub: thlotto3239-star

---

**อัพเดทล่าสุด: 2026-05-22 (15:30)**
- ✅ สร้าง SYSTEM_CONNECTIONS.md
- ✅ อัพเดทข้อมูลการเชื่อมต่อทั้งหมด
- ✅ เพิ่มขั้นตอนการพัฒนาที่ชัดเจน
