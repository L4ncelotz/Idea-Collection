# Idea Vault — Setup Guide (คู่มือติดตั้ง)

> โค้ดทั้งแอปพร้อมแล้ว เหลือตั้งค่า 3 อย่าง: **Supabase project → Google OAuth → .env.local**
> ใช้เวลารวมประมาณ 10–15 นาที (ทำครั้งเดียว)

---

## 1. สร้าง Supabase Project (ฐานข้อมูลคลาวด์ + ระบบบัญชี)

1. เปิด <https://supabase.com> → **Sign in** (ใช้ GitHub/Google ก็ได้)
2. กด **New project**
   - Name: `idea-vault`
   - Database Password: กด Generate (ไม่ต้องจำ — เราไม่ได้ใช้ตรง ๆ ใน MVP นี้)
   - Region: เลือกใกล้เราที่สุด เช่น **Singapore**
3. รอสร้างโปรเจกต์สำเร็จ (ประมาณ 1–2 นาที)

## 2. สร้างตาราง `ideas`

1. ในเมนูซ้ายเลือก **SQL Editor** → **New query**
2. เปิดไฟล์ `supabase/schema.sql` จากโปรเจกต์นี้ คัดลอก **ทั้งไฟล์** วางใน editor แล้วกด **Run** (Ctrl+Enter)
3. ควรเห็น `Success. No rows returned` — เสร็จแล้ว:
   - ตาราง `ideas` (Title / Description / README / Status)
   - **RLS policy** — บังคับว่าทุกคนเห็น/แก้ได้เฉพาะไอเดียของตัวเอง
   - index เรียงรายการตามอัปเดตล่าสุด

> ต้องการข้อมูลตัวอย่างสำหรับทดสอบ? (TinyDiff, Focus Garden ฯลฯ) — ต้องรอจน Step 6 ก่อน (ต้องมี user):
> เปิด **SQL Editor** อีกครั้ง วางเนื้อหาของ `supabase/seed.sql` แล้ว Run

## 3. เปิด Provider ฝั่ง Supabase (auth กับ Google)

> อย่าเปิดให้ทำงานก่อนจะสร้าง OAuth credentials — ทำ Step 4 จบก่อนแล้วกลับมาตั้งค่าขั้นนี้

1. เมนูซ้าย **Authentication** → tab **Providers**
2. เลือก **Google** → สวิตช์ **Enable**
3. ใส่ **Client ID** และ **Client Secret** จาก Step 4 → กด **Save**

## 4. สร้าง Google OAuth Credentials

1. เปิด <https://console.cloud.google.com> → **Create project** ชื่อ `idea-vault` (หรือใช้โปรเจกต์เดิม)
2. เมนูด้านซ้าย **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Create
   - กรอก **App name** = `Idea Vault`, ระบุ email เราเองและ Developer contact email แล้วกด **Save and continue**
   - หน้า Scopes / Test users: Skip (กด Next จนเสร็จ) — ใช้ default scopes
3. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback` (ดู Project ref ได้จาก Supabase: **Settings → API → Project URL**)
4. กด **Create** → **คัดลอก Client ID และ Client Secret** เก็บไว้ (ใช้ใน Step 3)

> ตอน deploy จริงบน Vercel ให้เพิ่มแบบนี้: เติม domain จริงของ Vercel ใน **Authorized JavaScript origins**
> กรณี error บอกว่า `redirect_uri_mismatch` — 95% คือ URL ช่อง redirect ไม่ตรง: `https://<ref>.supabase.co/auth/v1/callback`

## 5. ตั้งค่า .env.local ในเครื่อง

1. คัดลอกไฟล์แม่แบบเป็น `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. เปิด **Supabase → Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` ← **Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← **anon public** key (ไม่ใช่ service_role)
3. วางค่าลง `.env.local` แล้วบันทึก

## 6. รันและลองใช้

```bash
npm run dev
```

1. เปิด <http://localhost:3000> → จะถูกส่งไปหน้า Login
2. กด **Sign in with Google** → เลือกบัญชี
3. กลับมาที่หน้า List → กด **+ New Idea** สร้างไอเดียแรก — มันถูกเก็บลง Postgres บนคลาวด์ทันที

> ✅ **ทดสอบ Cloud Sync (ตาม Definition of Done):** เปิด browser อื่น หรือโทรศัพท์ ล็อกอินด้วยบัญชีเดียวกัน — จะเห็นไอเดียชุดเดียวกัน

## 7. Run the E2E tests (Playwright)

ครั้งแรก: ติดตั้ง browser แล้วล็อกอินด้วยมือคุณเอง 1 ครั้ง (ระบบเก็บ session ไว้ให้)

```bash
npx playwright install chromium   # ครั้งเดียว
npm run e2e                       # ระบบเปิดเว็บให้ — คุณทำงานล็อกอินเอง เดี๋ยวระบบเก็บ session
```

Session จะถูกเก็บที่ `tests/.auth/user.json` (git-ignored) — ครั้งถัด ๆ ไป `npm run e2e` ใช้ session นี้รัน lifecycle ทั้งไลน์ให้เอง (create → search → edit → status → delete)

> หมายเลยเพิ่ม: ถ้า dev server ยังไม่ได้รัน Playwright จะสั่ง `npm run dev` ให้เอง (config webServer)

## 8. Deploy ขึ้น Vercel

1. ผลัก (push) ทั้ง repo ไป **GitHub** แล้วเข้า <https://vercel.com> → **Add New Project** → Import repo
2. ในหน้า Environment Variables เพิ่ม `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. กลับไปที่ **Google console → Credentials** เปิด OAuth client → เพิ่ม `https://<your-project>.vercel.app` ใน **Authorized JavaScript origins**
4. **Supabase → Auth → Sign in / Up → Redirect URLs & Site URL**: เพิ่ม `https://<your-project>.vercel.app/auth/callback` และตั้ง Site URL ให้ตรง
5. Deploy เสร็จเปิด URL ลองล็อกอินด้วยมือถือ/หลายเครื่อง (ไอเดียทุกอุปกรณ์เห็นชุดเดียวกัน)

---

### แหล่งอ้างอิงเร็ว

- Supabase SSR docs: <https://supabase.com/docs/guides/auth/server-side/nextjs>
- Next.js proxy convention (middleware ใหม่): <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
- Design spec ของโปรเจกต์: `docs/superpowers/specs/2026-10-30-idea-vault-design.md`
