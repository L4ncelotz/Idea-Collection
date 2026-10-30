-- Dev-only seed: the 7 starter examples from the product spec.
-- Run AFTER you signed in once (it finds your user via auth.users).
-- DO NOT run on production data you care about.

do $$
declare
  target_user_id uuid := (
    select u.id
    from auth.users as u
    order by u.created_at
    limit 1
  );
begin
  if target_user_id is null then
    raise exception 'No user found — sign in to the app once, then run this again.';
  end if;

  insert into public.ideas (user_id, title, description, readme, status)
  values
    (target_user_id, 'TinyDiff',
     'เปรียบเทียบ Text / JSON / Code สองฝั่งและไฮไลต์จุดต่าง',
     e'# TinyDiff\n\n## Concept\nเปรียบเทียบข้อความ/โค้ดสองฝั่ง ไฮไลต์บรรทัดที่ต่างกัน\n\n## Core Features\n- Side-by-side diff\n- JSON mode\n- Copy diff as markdown', 'Idea'),
    (target_user_id, 'Focus Garden',
     'Pomodoro Timer ที่ปลูกต้นไม้ตามเวลาโฟกัส',
     e'# Focus Garden\n\n## Concept\nจับเวลาโฟกัสพร้อมสวนต้นไม้ที่เติบโตเมื่อทำงานสำเร็จ\n\n## Core Features\n- Focus timer\n- Plant growth animation\n- บันทึกความคืบหน้า\n\n## Later\n- ต้นไม้หลายชนิด\n- สถิติย้อนหลัง', 'Idea'),
    (target_user_id, 'RepoShelf',
     'แกลเลอรีโชว์ GitHub Repositories ของตัวเอง',
     'Grid layout แสดง repo ของเรา พร้อม language badges และ stars', 'Building'),
    (target_user_id, 'DevPocket',
     'เว็บรวมเครื่องมือเล็ก ๆ เช่น JSON Formatter, Base64, UUID',
     'หน้าเดียว เครื่องมือเล็ก ๆ ที่ใช้บ่อย ทำงานทุก tab ไว ไม่กระพริบ', 'Idea'),
    (target_user_id, 'Streakly',
     'บันทึกนิสัยรายวันและแสดง Heatmap',
     'Check-in รายวัน + heatmap แบบ GitHub style', 'Idea'),
    (target_user_id, 'Tiny Dungeon',
     'เกม Dungeon แบบ Turn-based ขนาดเล็ก',
     'Dungeon procedural เล็ก ๆ เข้าห้อง สู้ เก็บของ ไปต่อ', 'Idea'),
    (target_user_id, 'ValueCheck',
     'เปรียบเทียบความคุ้มค่าระหว่างราคาและคะแนน Benchmark',
     'ใส่ราคา + คะแนน benchmark ของ 2 ตัวเลือก ได้ decision แนะนำ', 'Done');
end $$;
