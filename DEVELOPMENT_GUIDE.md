# DEVELOPMENT GUIDE - TH-LOTTO Admin Panel

## วัตถุประสงค์
เอกสารนี้เป็นคู่มือการพัฒนาสำหรับ Admin Panel ของ TH-LOTTO Premium โดยเฉพาะ

## ก่อนเริ่มพัฒนา

### 1. อ่านเอกสารก่อน (ตามลำดับ)
- PROJECT_GUIDE.md - กฎเหล็กและข้อมูลโปรเจค
- AGENT_HANDOFF.md - ข้อมูลส่งมอบโปรเจค
- PROJECT_STATUS.md - สถานะโปรเจคปัจจุบัน
- CHANGELOG.md - ประวัติการเปลี่ยนแปลง
- AI_WORKFLOW.md - workflow การทำงาน

### 2. ตรวจสอบสภาพแวดล้อม
- ตรวจสอบว่าอยู่ใน repo ที่ถูกต้อง: `TH-LOTTO-Admin-push`
- ตรวจสอบ branch: `master` (ไม่ใช่ `main`)
- ตรวจสอบ local path: `D:\TH-LOTTO-Projects\TH-LOTTO-Admin-push`

### 3. ตรวจสอบ Environment Variables
- ตรวจสอบว่า `.env` มีค่าที่ถูกต้อง
- ตรวจสอบว่า Vercel project มี environment variables ที่ถูกต้อง
- Project ID: `prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM`

## การพัฒนา

### 1. สร้าง Checkpoint
```bash
git add -A
git commit -m "checkpoint: before work"
git tag -a checkpoint-YYYYMMDD-HHMMSS -m "Safety checkpoint"
git push origin master
git push --tags
```

### 2. ตรวจสอบ Field Name
- อ่าน RPC function definitions จาก Supabase
- อ่าน database schema จาก Supabase
- เปรียบเทียบ field name กับ frontend code
- ตรวจสอบว่า field name ตรงกันก่อนเรียก RPC

### 3. แก้โค้ด
- ใช้ฟังก์ชั่นที่มีอยู่แล้วเท่านั้น
- ห้ามสร้างฟังก์ชั่นใหม่โดยไม่ตรวจสอบ
- ห้ามแก้โค้ดที่ทำงานได้อยู่แล้ว

### 4. ทดสอบ
- ทดสอบใน local environment ก่อน
- ตรวจสอบ console errors
- ตรวจสอบ network requests
- ตรวจสอบว่า RPC functions ทำงานได้

### 5. Deploy
```bash
git add -A
git commit -m "describe changes clearly"
git push origin master
npx vercel --prod --yes
```

### 6. ตรวจสอบ Live Site
- เปิด https://th-lotto-admin.vercel.app
- ตรวจสอบว่า feature ที่แก้ไขทำงานได้
- ตรวจสอบ console errors
- ตรวจสอบ network requests

## การอัพเดทเอกสาร

### 1. อัพเดท CHANGELOG.md
- เพิ่ม version ใหม่ด้านบนสุด
- บันทึกสิ่งที่เปลี่ยนแปลง
- ระบุวันที่ (YYYY-MM-DD)

### 2. อัพเดท PROJECT_STATUS.md
- อัพเดท Current Version
- อัพเดท Latest Deployment
- อัพเดท Known Issues (ถ้ามี)

### 3. Commit + Push + Deploy Docs
```bash
git add CHANGELOG.md PROJECT_STATUS.md
git commit -m "docs: update CHANGELOG and PROJECT_STATUS"
git push origin master
npx vercel --prod --yes
```

## ห้ามทำ

- ❌ สร้างฟังก์ชั่นใหม่โดยไม่ตรวจสอบว่ามีอยู่แล้ว
- ❌ แก้โค้ดที่ทำงานได้อยู่แล้ว
- ❌ deploy ไป domain อื่น
- ❌ เปลี่ยน auth flow (SHA256)
- ❌ ลบ DB schema โดยไม่ตรวจสอบ references
- ❌ ข้ามการอัพเดทเอกสาร
- ❌ rewrite functions โดยไม่ preserve field names

## ตรวจสอบก่อน Deploy

### 1. ตรวจสอบ Project ID
- ตรวจสอบ `.vercel/project.json`
- ตรวจสอบว่า project ID ถูกต้อง: `prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM`

### 2. ตรวจสอบ Environment Variables
- ตรวจสอบว่า Vercel project มี environment variables ที่ถูกต้อง
- ตรวจสอบ `VITE_SUPABASE_URL`
- ตรวจสอบ `VITE_SUPABASE_ANON_KEY`

### 3. ตรวจสอบ Branch
- ตรวจสอบว่าอยู่ใน branch `master` (ไม่ใช่ `main`)

## การ Debug

### 1. ใช้ Supabase MCP Tools
- `mcp1_execute_sql` - สำหรับ query database
- `mcp1_list_tables` - สำหรับดูตาราง
- `mcp1_get_logs` - สำหรับดู logs

### 2. ใช้ Vercel MCP Tools
- `mcp0_list_deployments` - สำหรับดู deployment history
- `mcp0_get_deployment` - สำหรับดู deployment details
- `mcp0_get_deployment_build_logs` - สำหรับดู build logs

## การแก้ปัญหา

### 1. Field Name ไม่ตรงกัน
- อ่าน RPC function definitions จาก Supabase
- อ่าน database schema จาก Supabase
- เปรียบเทียบ field name กับ frontend code
- แก้ frontend ให้ตรงกับ RPC/DB

### 2. Deployment ไม่สำเร็จ
- ตรวจสอบ build logs
- ตรวจสอบ environment variables
- ตรวจสอบ project ID
- ตรวจสอบ branch

### 3. RPC Function ไม่ทำงาน
- ตรวจสอบ RPC function definitions
- ตรวจสอบ database schema
- ตรวจสอบ field name
- ตรวจสอบ permissions

## การทำงานร่วมกับ User App

### 1. Database Sharing
- Admin Panel และ User App ใช้ database เดียวกัน
- ตรวจสอบว่าการเปลี่ยนแปลง schema ไม่กระทบ User App

### 2. RPC Functions
- Admin RPCs และ User App RPCs แยกกันโดยสมบูรณ์
- ตรวจสอบว่าการเปลี่ยนแปลง RPC ไม่กระทบ User App

### 3. Instant Lottery
- Instant Lottery เป็นระบบแยกจาก Main Lottery
- ตรวจสอบว่าการเปลี่ยนแปลงไม่กระทบ Main Lottery

## การติดต่อ

### 1. Project Owner
- GitHub: thlotto3239-star
- ติดต่อผ่าน GitHub

### 2. Support
- ตรวจสอบเอกสารใน repo ก่อน
- ถ้ายังไม่แก้ไข ให้ติดต่อ project owner

---

**อัพเดทล่าสุด: 2026-05-15**
- ✅ สร้าง DEVELOPMENT_GUIDE.md
- ✅ อัพเดทเอกสารให้ตรงกับ v1.0.6
