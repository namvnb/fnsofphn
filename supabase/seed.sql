create extension if not exists pgcrypto;

do $$
declare
  demo_user_id uuid := '11111111-1111-4111-8111-111111111111';
  demo_email text := 'demo@lifeos.local';
  singing_id uuid;
  body_id uuid;
  story_id uuid;
  coding_id uuid;
  game_id uuid;
  learning_id uuid;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    demo_user_id,
    'authenticated',
    'authenticated',
    demo_email,
    crypt('lifeos-demo-123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Người vận hành Demo"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    ''
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    demo_user_id,
    demo_user_id::text,
    jsonb_build_object('sub', demo_user_id::text, 'email', demo_email),
    'email',
    now(),
    now(),
    now()
  )
  on conflict do nothing;

  insert into public.profiles (user_id, email, full_name, birth_date, western_zodiac_label, lunar_year_label, element_label, preferred_theme)
  values (demo_user_id, demo_email, 'Người vận hành Demo', '1997-04-09', 'Bạch Dương', 'Đinh Sửu', 'Giản Hạ Thủy', 'aether')
  on conflict (user_id) do update
  set full_name = excluded.full_name,
      birth_date = excluded.birth_date,
      western_zodiac_label = excluded.western_zodiac_label,
      lunar_year_label = excluded.lunar_year_label,
      element_label = excluded.element_label;

  insert into public.spiritual_profiles (
    user_id,
    birth_date,
    western_zodiac_label,
    lunar_year_label,
    element_label,
    clarity_score,
    energy_score,
    ritual_text,
    feng_shui_focus_text,
    reflection_note
  )
  values (
    demo_user_id,
    '1997-04-09',
    'Bạch Dương',
    'Đinh Sửu',
    'Giản Hạ Thủy',
    76,
    72,
    '10 phút thở chậm, ghi một cảm xúc thật và một hành động làm dịu.',
    'Góc làm việc sáng, ít vật nhiễu, có một điểm xanh/cyan nhẹ.',
    'Mang tính tham khảo / tự quan sát bản thân, không phải kết luận khoa học.'
  )
  on conflict (user_id) do update set clarity_score = excluded.clarity_score;

  insert into public.strategy_profiles (
    user_id,
    life_theme,
    strongest_leverage,
    blind_spot,
    next_90_days_plan,
    non_negotiables,
    focus_level_score
  )
  values (
    demo_user_id,
    'Xây năng lực dài hạn bằng nhịp sống ổn định và năng lượng được tích lũy mỗi ngày.',
    'Coding sâu với nhạc nền êm, học thực dụng và drill kỹ năng hẹp đến mức thành phản xạ.',
    'Khi cảm xúc bị nén, sự tập trung giảm trước khi bản thân kịp nhận ra.',
    '90 ngày: ổn định ngủ, hoàn thành một dự án Next/Supabase, luyện một kỹ năng game có chủ đích, ghi mood hằng ngày.',
    array['Ngủ đủ', 'Một phiên deep work', 'Một hoạt động tích lũy năng lượng', 'Một điều học được dùng ngay'],
    78
  )
  on conflict (user_id) do update set focus_level_score = excluded.focus_level_score;

  insert into public.tasks (user_id, title, status, category, priority, due_on, notes)
  values
    (demo_user_id, 'Hoàn thiện schema Supabase cho Life OS', 'doing', 'Coding', 5, current_date, 'RLS phải rõ, không dùng helper cũ.'),
    (demo_user_id, 'Viết checklist deploy Vercel', 'todo', 'Triển khai', 4, current_date + interval '1 day', 'Đảm bảo env public đúng.'),
    (demo_user_id, 'Tổng kết một kiến thức thực dụng', 'todo', 'Học tập', 4, current_date, 'Ghi một ứng dụng ngay trong tuần.'),
    (demo_user_id, 'Dọn góc làm việc', 'done', 'Nền sống', 2, current_date - interval '1 day', 'Giữ mặt phẳng sạch để dễ vào flow.')
  on conflict do nothing;

  insert into public.recurring_task_templates (user_id, title, category, priority, cadence, next_due_on, notes, is_active)
  select demo_user_id, seed.title, seed.category, seed.priority, seed.cadence, seed.next_due_on, seed.notes, true
  from (
    values
      ('Làm bảng công', 'Công việc', 4, 'monthly', current_date, 'Tổng hợp ngày công, giờ làm, nghỉ phép và ghi chú cần gửi.'),
      ('Dọn dẹp bộ nhớ máy tính', 'Bảo trì cá nhân', 3, 'weekly', current_date, 'Xóa file tạm, gom thư mục tải xuống, kiểm tra dung lượng ổ đĩa.'),
      ('Lên kế hoạch chi tiêu hàng tháng', 'Tài chính', 5, 'monthly', current_date, 'Xem thu nhập dự kiến, khoản cố định, khoản tiết kiệm và ngân sách linh hoạt.')
  ) as seed(title, category, priority, cadence, next_due_on, notes)
  where not exists (
    select 1
    from public.recurring_task_templates existing
    where existing.user_id = demo_user_id
      and existing.title = seed.title
  );

  insert into public.daily_priorities (user_id, title, rank, completed, planned_on)
  values
    (demo_user_id, 'Một khối coding sâu với nhạc nền êm', 1, false, current_date),
    (demo_user_id, 'Hoàn tất một hoạt động tích lũy năng lượng', 2, false, current_date),
    (demo_user_id, 'Ghi lại một điều học được có thể dùng ngay', 3, true, current_date)
  on conflict (user_id, planned_on, rank) do update set title = excluded.title;

  insert into public.quick_notes (user_id, title, body, color, is_pinned)
  select demo_user_id, seed.title, seed.body, seed.color, seed.is_pinned
  from (
    values
      ('Ý tưởng R&D', 'Thử gom các việc lặp lại thành hàng chờ riêng ở góc task.', 'cyan', true),
      ('Ghi chú nhanh', 'Nhớ kiểm tra tương phản CTA sau khi đổi gradient utility.', 'indigo', false)
  ) as seed(title, body, color, is_pinned)
  where not exists (
    select 1
    from public.quick_notes existing
    where existing.user_id = demo_user_id
      and existing.title = seed.title
  );

  insert into public.finance_entries (user_id, type, category, amount, occurred_on, notes)
  values
    (demo_user_id, 'income', 'Lương / dự án', 42000000, current_date - interval '2 day', 'Dòng tiền chính của tháng.'),
    (demo_user_id, 'expense', 'Ăn uống', 1650000, current_date - interval '1 day', 'Theo dõi để không tăng âm thầm.'),
    (demo_user_id, 'expense', 'Công cụ học tập', 890000, current_date, 'Chi cho năng lực.'),
    (demo_user_id, 'saving', 'Quỹ tự do', 9000000, current_date, 'Tự động chuyển đầu tháng.')
  on conflict do nothing;

  insert into public.health_logs (user_id, logged_on, sleep_hours, water_liters, steps, workouts_count, energy_score, notes)
  values
    (demo_user_id, current_date - interval '3 day', 6.5, 1.8, 5200, 0, 62, 'Hơi thiếu ngủ.'),
    (demo_user_id, current_date - interval '2 day', 7.2, 2.1, 7600, 1, 74, 'Cơ thể nhẹ hơn.'),
    (demo_user_id, current_date - interval '1 day', 7.8, 2.4, 8400, 1, 81, 'Năng lượng tốt.'),
    (demo_user_id, current_date, 7.0, 2.0, 6800, 0, 76, 'Ổn định, cần đi bộ thêm.')
  on conflict (user_id, logged_on) do update set energy_score = excluded.energy_score;

  insert into public.study_sessions (user_id, topic, duration_minutes, occurred_on, weekly_target_minutes, notes)
  values
    (demo_user_id, 'Supabase SSR và RLS', 70, current_date - interval '2 day', 600, 'Cookie SSR cần proxy refresh.'),
    (demo_user_id, 'Next.js App Router', 55, current_date - interval '1 day', 600, 'Server actions hợp với form CRUD.'),
    (demo_user_id, 'Kiến thức thực dụng', 45, current_date, 600, 'Chỉ giữ phần có thể dùng ngay.')
  on conflict do nothing;

  insert into public.time_logs (user_id, logged_on, deep_work_minutes, screen_time_minutes, top_priorities, planning_notes)
  values
    (demo_user_id, current_date - interval '1 day', 120, 260, array['Build module energy', 'Review RLS', 'Ghi mood'], 'Ngày khá sạch.'),
    (demo_user_id, current_date, 95, 210, array['Coding sâu', 'Học thực dụng', 'Drill kỹ năng'], 'Giữ nhịp calm work.')
  on conflict (user_id, logged_on) do update set deep_work_minutes = excluded.deep_work_minutes;

  insert into public.relationship_logs (user_id, person_name, action_taken, completed, occurred_on, notes)
  values
    (demo_user_id, 'Bạn thân', 'Nhắn hỏi thăm sau một tuần bận', true, current_date - interval '1 day', 'Giữ kết nối nhẹ.'),
    (demo_user_id, 'Đồng nghiệp', 'Gửi tài liệu hữu ích', true, current_date, 'Tạo giá trị nhỏ.')
  on conflict do nothing;

  insert into public.emotion_logs (user_id, logged_on, mood_score, gratitude_text, journal_text)
  values
    (demo_user_id, current_date - interval '3 day', 6, 'Có thời gian nghỉ ngắn.', 'Cảm xúc hơi căng vì nhiều context.'),
    (demo_user_id, current_date - interval '2 day', 7, 'Một buổi coding mượt.', 'Nhạc nền giúp vào flow tốt.'),
    (demo_user_id, current_date - interval '1 day', 8, 'Cơ thể nhẹ hơn sau vận động.', 'Cần duy trì nhịp ngủ.'),
    (demo_user_id, current_date, 7, 'Có một khoảng yên để học.', 'Ổn định, vẫn cần xả cảm xúc chủ động.')
  on conflict (user_id, logged_on) do update set mood_score = excluded.mood_score;

  insert into public.energy_activity_types (user_id, name, category, description, sort_order, is_active)
  values
    (demo_user_id, 'Hát to để giải tỏa cảm xúc', 'emotional_release', 'Một phiên xả cảm xúc bằng giọng, không cần hoàn hảo.', 1, true),
    (demo_user_id, 'Tập đi tập lại những động tác cầu đơn giản', 'body_rhythm', 'Lặp nhịp cơ thể để tích lũy cảm giác ổn định.', 2, true),
    (demo_user_id, 'Flow đọc truyện và nhập vai nhân vật giả tưởng', 'imagination_flow', 'Cho trí tưởng tượng được chảy tự nhiên qua nhân vật.', 3, true),
    (demo_user_id, 'Coding với nhạc nền êm ái', 'deep_work_calm', 'Một khối làm việc tĩnh, sâu, có nhạc nền làm mềm hệ thần kinh.', 4, true),
    (demo_user_id, 'Game tập trung luyện tối đa kỹ năng một tướng', 'skill_drilling', 'Drill một kỹ năng thật hẹp, ví dụ Yasuo E Q Flash.', 5, true),
    (demo_user_id, 'Học hỏi kiến thức thực dụng', 'practical_learning', 'Chọn kiến thức có thể dùng ngay, ghi lại một ứng dụng cụ thể.', 6, true)
  on conflict do nothing;

  select id into singing_id from public.energy_activity_types where user_id = demo_user_id and category = 'emotional_release' order by sort_order limit 1;
  select id into body_id from public.energy_activity_types where user_id = demo_user_id and category = 'body_rhythm' order by sort_order limit 1;
  select id into story_id from public.energy_activity_types where user_id = demo_user_id and category = 'imagination_flow' order by sort_order limit 1;
  select id into coding_id from public.energy_activity_types where user_id = demo_user_id and category = 'deep_work_calm' order by sort_order limit 1;
  select id into game_id from public.energy_activity_types where user_id = demo_user_id and category = 'skill_drilling' order by sort_order limit 1;
  select id into learning_id from public.energy_activity_types where user_id = demo_user_id and category = 'practical_learning' order by sort_order limit 1;

  insert into public.energy_activity_logs (user_id, activity_type_id, logged_on, completed, duration_minutes, notes)
  values
    (demo_user_id, singing_id, current_date, true, 8, 'Xả được cảm xúc bị nén.'),
    (demo_user_id, body_id, current_date, false, null, null),
    (demo_user_id, story_id, current_date, true, 30, 'Vào flow đọc truyện khá sâu.'),
    (demo_user_id, coding_id, current_date, true, 95, 'Coding yên với nhạc nền êm.'),
    (demo_user_id, game_id, current_date, false, null, 'Để tối drill kỹ năng.'),
    (demo_user_id, learning_id, current_date, true, 45, 'Ghi lại một pattern dùng được.')
  on conflict (user_id, activity_type_id, logged_on) do update
  set completed = excluded.completed,
      duration_minutes = excluded.duration_minutes,
      notes = excluded.notes;
end;
$$;
