# Idea Vault — Design Document

> **Think it. Save it. Build it later.**
> วันที่: 2026-10-30 · สถานะ: อนุมัติ design แล้ว (รอทำ implementation plan)

เอกสารนี้ต่อยอดจาก product spec ใน `README (1).md` (root ของ repo) และบันทึกการตัดสินใจทางเทคนิค สถาปัตยกรรม และขอบเขต MVP ที่ตกลงกันในบทสนทนา

## 1. การตัดสินใจที่ตกลงกัน

| หัวข้อ | การตัดสินใจ | เหตุผลสั้น ๆ |
| --- | --- | --- |
| ผู้ใช้เป้าหมาย | หลายคน — ทุกคนมีบัญชี แยกข้อมูลของตัวเอง | ข้อกำหนดจาก user; ต้องมี auth จริง |
| Cloud Sync | ต้องออนไลน์ตลอด | ตัด local DB + conflict handling ออกทั้งก้อน |
| Stack | Next.js + Supabase | จุดต่ำสุดของความเสี่ยง; RLS + auth สำเร็จรูป |
| Desktop/Electron/Tauri | ไม่ทำ MVP นี้ | ชนกับ "เปิดจากมือถือ/ทุกอุปกรณ์"; ค่อย wrap ด้วย Tauri ภายหลังได้ |
| Go / Bun / Elysia / Rust backend | ไม่ทำ | backend เล็กมาก (~150 บรรทัด logic) ไม่คุ้มกับงานเพิ่มอีก 30–40% (auth/deploy ต้องทำเอง) |
| Pin/Favorite | ไม่ทำ MVP | YAGNI — เพิ่มทีหลังได้เร็ว |

## 2. สถาปัตยกรรม

```
Next.js (App Router, TypeScript, Tailwind)  ←→  Supabase (Postgres + Auth)
        deploy: Vercel (free tier)                   host: Supabase (free tier)
```

- เว็บเดียว responsive รองรับคอมและมือถือ (ตอบเป้าหมาย "ทุกอุปกรณ์")
- "Cloud Sync" = ข้อมูลอยู่บน Cloud Postgres เปิดจากอุปกรณ์ไหนก็เห็นชุดเดียวกัน — ไม่มี offline, ไม่มี local cache เป็น source of truth
- ทุกคำสั่งอ่าน/เขียนข้อมูลไปตรงที่ Supabase จาก client (server component + client component ตามสมควร) — ไม่มี API layer ของเราเอง
- ความปลอดภัยถูกบังคับที่ฐานข้อมูลด้วย Row Level Security (RLS) ไม่ใช่ด้วย logic ของหน้าเว็บ

## 3. Data Model

ตารางเดียว:

```sql
create table ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  description text not null default '',
  readme      text not null default '',
  status      text not null default 'Idea' check (status in ('Idea','Building','Done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table ideas enable row level security;

create policy "users manage own ideas"
  on ideas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index ideas_user_idx on ideas (user_id, updated_at desc);
```

หมายเหตุ:

- `updated_at` ตั้งค่าจาก client ทุกครั้งที่บันทึก (ไม่เขียน trigger เพื่อความเรียบง่าย)
- Status ย้ายไปมาอิสระระหว่างสามค่า ไม่บังคับทิศทาง Idea → Building → Done
- การค้นหา (MVP) เป็น client-side filter บน `title` + `description` — ต่อบัญชีอยู่ระดับไม่กี่สิบรายการ ยังไม่ต้องใช้ Postgres full-text search; ค่อยย้ายไปยัง Postgres full-text search เมื่อเห็นว่าข้อมูลเริ่มช้า

## 4. Authentication

- Provider เดียว: **Google Sign-in** ผ่าน Supabase Auth (`signInWithOAuth`)
- Flow: `/login` → Google popup → Supabase callback → กลับ `/`
- ทุกหน้าที่ต้องมีบัญชี guard ด้วย session check (middleware + server session ด้วย cookie ผ่าน `@supabase/ssr`)
- session หมดอายุ/ยกเลิก → แอปพาผู้ใช้กลับไปที่ `/login` อัตโนมัติ
- ไม่มี guest mode — เพื่อไม่สร้างปัญหา "ข้อมูลหลุดอยู่แค่ในเครื่องไหน" ภายหลัง

## 5. หน้าจอและ UX (ตาม product spec)

- **`/login`** — ปุ่ม "Sign in with Google" บนพื้นหลังเรียบ
- **`/` (Idea List)**
  - หัวข้อ "Your Ideas", ปุ่ม **+ New Idea**, ช่องค้นหา (filter ทันทีใน client)
  - การ์ดแสดง: Title, Description, ป้าย Status (Idea / Building / Done — ใช้สามสีต่างกันชัดตา)
  - คลิกการ์ด → เปิดหน้า Detail
  - Empty state ตอนไม่มีไอเดีย (พร้อมคำใบ้ให้กดไอเดียแรก)
  - **New Idea modal**: กรอก Title (required) + Description แล้ว Save — ไม่บังคับ README
- **`/ideas/[id]` (Detail/Edit)**
  - แก้ได้: Title, Description, Status
  - README editor: สลับ **Edit / Preview** — editor เป็น CodeMirror (markdown mode), preview จาก react-markdown; เนื้อหาเริ่มต้นเป็นค่าว่างได้
  - ปุ่ม **Save** (บันทึกเป็นรอบ, ไม่ auto-save, อัปเดต `updated_at`) และปุ่ม **Delete** (modal ยืนยัน → hard delete)
  - มีข้อความ "Updated X ago" บอกอัปเดตล่าสุดเพื่อการกลับอ่าน

แนวทาง UI: Modern, Minimalist, Clean — Tailwind utilities ล้วน ไม่ใช้ component framework ใหญ่

## 6. ระบบและเครื่องมือเลือกใช้

| ส่วน | ทางเลือก |
| --- | --- |
| Framework | Next.js 15 (App Router, React Server Components) + TypeScript |
| Styling | Tailwind CSS v4 |
| DB/Auth | Supabase (Postgres + Google OAuth) ผ่าน `@supabase/supabase-js` + `@supabase/ssr` |
| Markdown preview | `react-markdown` + `remark-gfm` |
| Markdown editor | `@uiw/react-codemirror` (CodeMirror 6, markdown mode) |
| Icons | `lucide-react` |
| Deploy | Vercel + Supabase ใช้ free tier ทั้งคู่ |

## 7. Error Handling

- Title ว่าง → inline validation (ไม่ให้ Save)
- ผิดพลาดเครือข่าย/DB ขณะ Save/Delete → toast บอกเหตุผล + ข้อมูลที่ค้างอยู่ในแบบฟอร์มไม่หาย (ไม่ throw เปล่า)
- ไม่พบไอเดีย (id ไม่มีในชุดของ user) → หน้า Not found — RLS ทำให้ query ผู้อื่นไม่เห็นข้อมูลอยู่แล้ว
- ปิดหน้า/เปลี่ยนหน้าทั้งที่มี unsaved change → เตือนก่อน (beforeunload หรือ modal ยืนยันขนาดเล็ก)

## 8. Testing

- **Unit tests**: ฟิลเตอร์ค้นหา, การ validate ชื่อ, การตัดสิน status, รูปแบบวันที่ "Updated ago" — ใช้ Vitest
- **E2E (Playwright)** กับ Supabase project ฝั่ง test (บัญชี Google ทดสอบ): login → สร้าง → แก้ README + preview → ค้นหา → เปลี่ยน status → ลบ (กับ empty state + ค้นหาไม่พบ)
- Seed script รายชื่อไอเดียจาก product spec (TinyDiff, Focus Garden, RepoShelf, DevPocket, Streakly, Tiny Dungeon, ValueCheck) — ใช้เฉพาะ dev/ทดสอบ ห้าม seed อัตโนมัติถึงบัญชีผู้ใช้จริง

## 9. Definition of Done (จาก product spec)

- [ ] เพิ่มไอเดียใหม่ได้รวดเร็วโดยไม่ต้องกรอก README
- [ ] ปิดเว็บแล้วเปิดใหม่ ข้อมูลยังอยู่
- [ ] เปิดจากอุปกรณ์อื่นด้วยบัญชีเดิม เห็นรายการที่บันทึกไว้
- [ ] แก้ไข README และดู Markdown Preview ได้
- [ ] ค้นหาไอเดียเก่าเจอและเปลี่ยนสถานะได้

## 10. Non-goals (ยืนยันรายการ "สิ่งที่ยังไม่ทำ")

AI สร้าง/วิเคราะห์ไอเดีย · แนบไฟล์/รูป/เอกสาร · เชื่อม GitHub · แชร์/ทีม/Collaboration · Kanban/Timeline/Deadline · หมวดหมู่/คะแนน/Analytics · Rich-text editor · Desktop app (Electron/Tauri) · Pin/Favorite · Offline mode

สิ่งเหล่านี้ไม่ใช่เงื่อนไข MVP; Tauri และ Pin ถูกบันทึกไว้เป็นฟีเจอร์ต่อยอดที่ทำได้ง่ายทีหลัง

## 11. ขั้นถัดไป: แผนการพัฒนา

หลังเอกสารนี้ผ่านการตรวจ ใช้ skill `writing-plans` แยกเป็นแผนปฏิบัติ: 1) scaffold โปรเจกต์ (git init เรียบร้อยแล้ว) · 2) Supabase project + schema + RLS · 3) auth + middleware · 4) Idea List + modal · 5) Detail/Edit + markdown · 6) ค้นหา + empty state · 7) ทดสอบ + deploy
