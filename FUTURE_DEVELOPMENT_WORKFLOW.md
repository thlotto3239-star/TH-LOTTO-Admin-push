# FUTURE DEVELOPMENT WORKFLOW - TH-LOTTO Admin Panel

> สร้าง: 2026-05-15
> วัตถุประสงค์: วางเวอร์ไฟว์มาตรฐานสำหรับการพัฒนาและอัปเดตโปรเจกต์ในอนาคต
> สำหรับ: AI model ทุกตัวที่จะทำงานกับโปรเจกต์นี้

---

## 📋 ข้อมูลโปรเจกต์

### User App
- **Repo:** thlotto3239-star/thlotto-premium
- **Branch:** main
- **Live URL:** https://th-lotto-app.vercel.app/
- **Local Path:** c:\Users\armyn\.windsurf\worktrees\thlotto-app-main\thlotto-app-main-9738fbe1
- **Stack:** React 19.1.0, Vite 6.3.5, Tailwind CSS 3.4.17, Supabase 2.49.4

### Admin Panel
- **Repo:** thlotto3239-star/TH-LOTTO-Admin-push
- **Branch:** master
- **Live URL:** https://th-lotto-admin.vercel.app/
- **Local Path:** D:\TH-LOTTO-Projects\TH-LOTTO-Admin-push
- **Stack:** React 19.1.0, Vite 6.3.5, Tailwind CSS 3.4.17, Supabase 2.49.4

### Backend
- **Supabase:** https://ygopnjbvccenryejqmlw.supabase.co
- **Shared Database:** User App และ Admin Panel ใช้ Supabase เดียวกัน

---

## 🔧 Environment Variables (CRITICAL)

### User App (th-lotto-app)
- `VITE_SUPABASE_URL`: https://ygopnjbvccenryejqmlw.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME

### Admin Panel (th-lotto-admin)
- `VITE_SUPABASE_URL`: https://ygopnjbvccenryejqmlw.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME

---

## 📝 ประวัติล่าสุด (2026-05-15)

### สิ่งที่ทำ
1. ตรวจสอบประวัติ Git commit วันที่ 14
2. ตรวจสอบ deployment history ใน Vercel
3. พบว่า deployment ที่ใช้งานได้ตามปกติก่อนหน้านี้ไม่มีอยู่ในระบบ Vercel แล้ว
4. พบ commit 6530fc2 (checkpoint: before deploy instant lottery admin panel) เป็น commit ก่อนการเพิ่มฟีเจอร์ instant lottery
5. เพิ่ม Environment Variables ใน Vercel Dashboard ของ Admin Panel (VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY)
6. Checkout ไป commit 6530fc2
7. Deploy ใหม่จาก commit 6530fc2
8. ตรวจสอบว่า deployment ใช้งานได้หรือไม่ (ผลลัพธ์: ใช้งานได้ตามปกติ)

### สถานะปัจจุบัน
- Admin Panel กลับมาทำงานได้ตามปกติแล้ว
- ไม่มีฟีเจอร์ instant lottery (เพราะ rollback ไป commit ก่อนเพิ่มฟีเจอร์)
- User App ทำงานได้ตามปกติ
- Environment Variables ถูกต้องทั้งสองโปรเจกต์

---

## 🚀 เวอร์ไฟว์การพัฒนาและอัปเดต (MANDATORY)

### ขั้นตอนที่ 1: อ่านเอกสารก่อนทำงาน (MANDATORY)
ก่อนทำงานทุกครั้ง AI ต้องอ่านเอกสารต่อไปนี้ก่อน:
1. `.windsurfrules` (auto-loaded by Windsurf)
2. `PROJECT_GUIDE.md` - คู่มือโปรเจกต์และกฎ
3. `DEVELOPMENT_GUIDE.md` - คู่มือการพัฒนา
4. `PROJECT_STATUS.md` - สถานะโปรเจกต์ปัจจุบัน
5. `CHANGELOG.md` - ประวัติการเปลี่ยนแปลง
6. `FUTURE_DEVELOPMENT_WORKFLOW.md` (ไฟล์นี้) - เวอร์ไฟว์การพัฒนาในอนาคต

### ขั้นตอนที่ 2: ตรวจสอบโปรเจกต์ที่จะแก้ไข (MANDATORY)
- User App: thlotto3239-star/thlotto-premium → branch main → local: c:\Users\armyn\.windsurf\worktrees\thlotto-app-main\thlotto-app-main-9738fbe1
- Admin Panel: thlotto3239-star/TH-LOTTO-Admin-push → branch master → local: D:\TH-LOTTO-Projects\TH-LOTTO-Admin-push
- ตรวจสอบ `.vercel/project.json` ว่า project ID ถูกต้องหรือไม่
  - User App: prj_tJriP88kWcWOSUQOo8E0UrwSJb7v (th-lottie-app)
  - Admin Panel: prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM (thlotto-admin)

### ขั้นตอนที่ 3: ใช้ workflow /checkpoint ก่อนแก้โค้ด (MANDATORY)
ก่อนทำการแก้โค้ดใดๆ จะต้อง:
1. Run workflow `/checkpoint` หรือทำการ commit + tag + push ไป GitHub
2. สร้าง checkpoint tag เช่น `checkpoint-YYYYMMDD-HHMMSS`
3. Push tag ไป GitHub เพื่อป้องกันการ rollback ไม่ได้

### ขั้นตอนที่ 4: อ่านโค้ดต้นฉบับก่อนแก้ไข (MANDATORY)
- อ่านโค้ดต้นฉบับทั้งหมดก่อนแก้ไข
- เปรียบเทียบ field name ระหว่าง frontend และ RPC/DB
- ตรวจสอบว่า function ที่จะแก้ไขมีการใช้งานที่ไหนบ้าง
- อย่าลบหรือเปลี่ยน field name ที่มีการใช้งานอยู่

### ขั้นตอนที่ 5: แก้โค้ดตามความต้องการ
- แก้โค้ดตามความต้องการ
- เก็บ field name เดิมไว้หากเป็นไปได้
- อย่าเขียน function ใหม่โดยไม่เก็บ logic เดิม

### ขั้นตอนที่ 6: Commit + Push + Deploy (MANDATORY)
```bash
# User App
git add .
git commit -m "description"
git push origin main
npx vercel --prod --yes

# Admin Panel
git add .
git commit -m "description"
git push origin master
npx vercel --prod --yes
```

### ขั้นตอนที่ 7: อัพเดต CHANGELOG.md + PROJECT_STATUS.md (MANDATORY)
```bash
# อัพเดต CHANGELOG.md
# เพิ่ม version ใหม่ด้านบนสุด
# อธิบายสิ่งที่เปลี่ยนแปลง

# อัพเดต PROJECT_STATUS.md
# อัพเดทส่วนที่เปลี่ยนแปลง + วันที่บนสุด
# อัพเดท deployment info

# Commit docs
git add CHANGELOG.md PROJECT_STATUS.md
git commit -m "docs: update CHANGELOG and PROJECT_STATUS"
git push origin main  # หรือ master สำหรับ Admin Panel
npx vercel --prod --yes
```

---

## 🚫 สิ่งที่ห้ามทำ (FORBIDDEN)

1. **ห้ามแตะต้องโค้ดที่ทำงานได้** ถ้าไม่ได้รับคำสั่ง
2. **ห้าม deploy ไป domain อื่น** ที่ไม่ใช่ th-lotto-app.vercel.app หรือ th-lotto-admin.vercel.app
3. **ห้ามสร้าง Vercel project ใหม่**
4. **ห้ามเปลี่ยน auth flow** (SHA256)
5. **ห้ามลบ DB schema โดยไม่ตรวจสอบ references**
6. **ห้าม skip documentation** (CHANGELOG.md, PROJECT_STATUS.md)
7. **ห้ามเขียน function ใหม่โดยไม่เก็บ field name/logic เดิม**

---

## ✅ สิ่งที่ต้องตรวจสอบก่อน deploy

1. **Environment Variables** ใน Vercel Dashboard
   - User App: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
   - Admin Panel: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

2. **Project ID** ใน `.vercel/project.json`
   - User App: prj_tJriP88kWcWOSUQOo8E0UrwSJb7v (th-lottie-app)
   - Admin Panel: prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM (thlotto-admin)

3. **Branch** ที่ใช้
   - User App: main
   - Admin Panel: master

4. **Repo** ที่ใช้
   - User App: thlotto3239-star/thlotto-premium
   - Admin Panel: thlotto3239-star/TH-LOTTO-Admin-push

---

## 📊 สรุปสถานะปัจจุบัน (2026-05-15)

### User App
- **Status:** ✅ ทำงานได้ตามปกติ
- **URL:** https://th-lotto-app.vercel.app/
- **Version:** 1.5.8
- **Environment Variables:** ✅ ถูกต้อง

### Admin Panel
- **Status:** ✅ ทำงานได้ตามปกติ (หลัง rollback ไป commit 6530fc2)
- **URL:** https://th-lotto-admin.vercel.app/
- **Version:** checkpoint-20260514-180000 (before instant lottery)
- **Environment Variables:** ✅ ถูกต้อง
- **Deployment:** https://th-lotto-admin-om1d4qfn8-thlotto3239-1721s-projects.vercel.app

### สิ่งที่เปลี่ยนแปลง
- Admin Panel rollback ไป commit 6530fc2 (ก่อนเพิ่มฟีเจอร์ instant lottery)
- เพิ่ม Environment Variables ใน Vercel Dashboard ของ Admin Panel
- ไม่มีฟีเจอร์ instant lottery ใน Admin Panel ตอนนี้

---

## 🔗 ลิ้งค์หน้าทางเข้า

### ผู้ใช้ (User App)
- **Live URL:** https://th-lotto-app.vercel.app/

### แอดมิน (Admin Panel)
- **Live URL:** https://th-lotto-admin.vercel.app/
- **Deployment URL:** https://th-lotto-admin-om1d4qfn8-thlotto3239-1721s-projects.vercel.app

---

## 📝 บันทึกสำคัญ

1. **ทุกครั้งที่จะแก้ไขอัพเดตจะต้องมีการใช้ workflow /checkpoint** เพื่อป้องกันโปรเจคพังทั้งหมด
2. **ตามค่าที่ถูกต้อง ตามหลักมาตรฐานที่เขาพัฒนาระบบกัน**
3. **ความเข้าใจของ AI แล้วทุกอย่างจะอัพเดทเป็นปัจจุบัน**
4. **จะต้องอัพเดตเสร็จสิ้น ไม่มีอะไรที่ค้างคาหรือหลงเหลืออยู่**
