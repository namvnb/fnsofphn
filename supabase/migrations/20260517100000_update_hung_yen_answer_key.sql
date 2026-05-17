with answer_key(question_number, correct_answer) as (
  values
    (1, '"C"'::jsonb),
    (2, '"B"'::jsonb),
    (3, '"A"'::jsonb),
    (4, '"C"'::jsonb),
    (5, '"A"'::jsonb),
    (6, '"A"'::jsonb),
    (7, '"C"'::jsonb),
    (8, '"C"'::jsonb),
    (9, '"B"'::jsonb),
    (10, '"B"'::jsonb),
    (11, '"A"'::jsonb),
    (12, '"A"'::jsonb),
    (13, '"D"'::jsonb),
    (14, '"C"'::jsonb),
    (15, '"C"'::jsonb),
    (16, '"C"'::jsonb),
    (17, '"C"'::jsonb),
    (18, '"B"'::jsonb),
    (19, '{"a": true, "b": true, "c": false, "d": false}'::jsonb),
    (20, '{"a": false, "b": true, "c": false, "d": true}'::jsonb),
    (21, '{"a": true, "b": false, "c": true, "d": true}'::jsonb),
    (22, '{"a": false, "b": true, "c": true, "d": false}'::jsonb),
    (23, '"10,7"'::jsonb),
    (24, '"3003"'::jsonb),
    (25, '"34"'::jsonb),
    (26, '"3"'::jsonb),
    (27, '"126"'::jsonb),
    (28, '"2"'::jsonb)
)
update public.giup_cy_exam_questions q
set
  correct_answer = answer_key.correct_answer,
  needs_review = false
from answer_key
where q.question_number = answer_key.question_number
  and exists (
    select 1
    from public.giup_cy_exams e
    where e.id = q.exam_id
      and e.slug = 'hung-yen-hki-hoa-12-2026-3d1d5844'
  );

