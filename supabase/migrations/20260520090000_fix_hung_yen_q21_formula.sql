update public.giup_cy_exam_questions q
set prompt = 'Tơ nylon-6,6 là loại tơ có tính dai, bền, mềm mại, óng mượt, ít thấm nước, giặt mau khô và được sử dụng để dệt vải may mặc, làm dây dù, đan lưới. Tơ nylon-6,6 được tổng hợp theo phương trình hóa học:
n H2N-[CH2]6-NH2 + n HOOC-[CH2]4-COOH -> (-HN-[CH2]6-NH-CO-[CH2]4-CO-)n + 2n H2O.'
where q.question_number = 21
  and exists (
    select 1
    from public.giup_cy_exams e
    where e.id = q.exam_id
      and e.slug = 'hung-yen-hki-hoa-12-2026-3d1d5844'
  );
