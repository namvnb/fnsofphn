# Nguyên tắc tạo đề thi

Tài liệu này dùng cho các lần tạo/import đề thi mới trong module Giúp Cy. Mục tiêu là tránh lặp lại các lỗi đã từng gặp: sai dữ liệu đề, sai đáp án, lộ đáp án, lỗi công thức hóa học, lỗi encoding, ghi đè chỉnh sửa thủ công và lỗi trải nghiệm làm bài.

## 1. Nguồn đề và dữ liệu gốc

- Luôn giữ file gốc trong `project content/De thi giup Cy` hoặc thư mục con rõ tên.
- Khi import từ Word/PDF, ưu tiên lấy text từ file gốc, không tự viết lại nếu chưa đối chiếu.
- Không sửa nội dung câu hỏi theo trí nhớ. Mọi chỉnh sửa phải dựa trên ảnh/PDF/Word gốc hoặc đáp án chính thức.
- Với đề có hình, bảng, sơ đồ, công thức hoặc dữ kiện nhiều dòng, phải kiểm tra lại sau import bằng giao diện làm bài.
- Tên đề, tỉnh/trường, lần thi và năm học phải giữ đúng theo nguồn, nhưng slug có thể chuẩn hóa để ổn định URL.

## 2. Chuẩn hóa cấu trúc đề

- Mỗi câu phải có `question_number`, `question_type`, `prompt`, `options` nếu là trắc nghiệm, `correct_answer` nếu đã có đáp án, và `points`.
- Không để trùng số câu trong cùng một đề.
- Không đổi loại câu sau khi đã có bài làm nếu không có lý do rõ ràng, vì có thể làm sai dữ liệu chấm.
- Quy ước loại câu:
  - `single_choice`: đáp án là một chữ cái như `A`, `B`, `C`, `D`.
  - `true_false`: đáp án là object JSON gồm các ý `a`, `b`, `c`, `d` với giá trị boolean.
  - `short_answer`: đáp án là chuỗi kết quả đã chuẩn hóa.
- Khi tách câu đúng/sai, bốn lựa chọn `a`, `b`, `c`, `d` phải là bốn mệnh đề thật của cùng câu. Không được để tiêu đề phần như `PHẦN III`, `Câu trắc nghiệm trả lời ngắn`, `HẾT` bị trích nhầm thành lựa chọn, đặc biệt là lựa chọn `d`.
- Điểm phải khớp cấu trúc đề thi. Ví dụ trắc nghiệm thường `0.25`, đúng/sai thường `1`, trả lời ngắn thường `0.25` nếu theo format hiện tại.

- Với câu trắc nghiệm có đáp án nằm cùng một dòng kiểu `A. ... B. ... C. ... D. ...`, sau import phải kiểm tra đủ đúng 4 lựa chọn `A`, `B`, `C`, `D`, không trùng key, không thiếu `D`, và không để phần đuôi câu hỏi như công thức `Q = m.C.Δt` hoặc câu dẫn bị kéo nhầm thành một lựa chọn.
- Nếu Word ngắt câu dẫn ngay trước dòng đáp án, ví dụ `Phương` ở cuối dòng trước rồi dòng sau là `pháp phù hợp...`, phải ghép đủ câu dẫn vào prompt trước khi tách options. Không được tạo option giả như `C. Phương` hoặc làm lệch key thành `C,A,B,C`.
- Khi câu hỏi có công thức/phương trình ngay trước dòng đáp án, phải đối chiếu ranh giới giữa prompt và options trên giao diện làm bài; công thức thuộc đề phải nằm trong prompt, còn options chỉ chứa nội dung đáp án.
- Nếu file gốc có phần `HƯỚNG DẪN GIẢI`/`Đáp án`, chỉ gán `correct_answer` sau khi đối chiếu giá trị đáp án với đúng lựa chọn trong câu hỏi. Ví dụ đáp án gốc ghi `203,9` thì phải map sang key `B` nếu lựa chọn `B` là `203,9`, không để null và không đoán theo tính toán riêng.

## 3. Đáp án và chấm điểm

- Không public đề có đáp án chưa rà soát nếu đề đó dùng để chấm thật.
- Đáp án nhập vào phải được đối chiếu ít nhất một lượt với nguồn chính thức.
- Với câu trả lời ngắn dạng số, lưu đáp án theo định dạng đơn giản nhất có thể, ví dụ `10,7`, `3003`, `34`.
- Với câu trả lời ngắn có nhiều số hoặc danh sách, phải test các cách học sinh có thể nhập: có dấu phẩy, dấu chấm phẩy, khoảng trắng, xuống dòng hoặc đánh số.
- Sau khi thêm/sửa đáp án, phải chạy thử một bài làm mẫu để kiểm tra tổng điểm, chi tiết đúng/sai và kết quả lưu.
- Không để đáp án đúng xuất hiện ở API/trang public. Trang làm bài chỉ nhận câu hỏi đã strip `correct_answer`.

## 4. Công thức, ký hiệu hóa học và bảng

- Sau import, kiểm tra thủ công các ký hiệu dễ lỗi:
  - Chỉ số dưới: `H2O`, `Fe2O3`, `Al2O3`.
  - Điện tích ion: `SO4^2-`, `NH4+`, `Fe3+`.
  - Ký hiệu nhiệt động: `ΔfH°298`, `ΔrH°298`, `kJ.mol^-1`.
  - Ký hiệu thế điện cực: phải giữ dạng `E°(Zn2+/Zn)`, `E°(Cu2+/Cu)`, `E°(Mg2+/Mg)`; không được để thành `Eo 2+`, mất tên kim loại trước dấu `/`, hoặc tách cặp điện cực khỏi giá trị.
  - Ký hiệu sức điện động chuẩn của pin phải giữ đủ dạng `E°pin(T-X) = 2,46V`; không được để Word run làm mất pin đầu tiên, lặp `pin(T-X)`, hoặc biến thành `Eo o pin(...)`.
  - Mũ, phần trăm, dấu âm, dấu phẩy thập phân.
  - Đơn vị diện tích/thể tích phải dùng số mũ dễ đọc khi hiển thị: `m²`, `cm³`, `dm³`; không để dạng phẳng `m2`, `cm3` nếu giao diện không render chỉ số trên. Với đơn vị vi mô giữ đúng `μm`.
  - Cấu hình electron phải hiển thị số electron bằng số mũ: `1s² 2s² 2p⁶ 3s¹`; không để dạng phẳng `1s2 2s2 2p6 3s1` trên giao diện làm bài.
- Không để công thức bị dính chữ hoặc mất chỉ số. Nếu công thức khó render, cần kiểm tra qua `FormattedText`.
- Bảng dữ liệu phải giữ hàng/cột rõ ràng. Nếu bảng từ Word bị vỡ, chuyển thành Markdown table hoặc text có dòng phân tách dễ đọc.
- Các câu có cụm `Cho các phát biểu sau`, `Cho các nhận định sau`, danh sách đánh số `(1)`, `(2)`, `(3)`, `(4)`, hoặc quy trình `Bước 1`, `Bước 2`, `Bước 3` phải giữ mỗi nhận định/bước trên một dòng riêng. Không gộp toàn bộ thành một đoạn văn dài vì học sinh rất khó đọc và dễ chọn sai.
- Với hình ảnh/sơ đồ, phải kiểm tra asset tồn tại, render được và nằm đúng câu hỏi.
- Nếu ảnh nằm ngay sau câu dẫn hoặc cùng paragraph với marker `Câu ...`, phải kiểm tra mapping asset theo `question_number`; không để ảnh của Câu 18 bị gán sang Câu 19 hoặc ảnh công thức cấu tạo của Câu 21 bị gán sang Câu 22.
- Câu có cụm `công thức cấu tạo như sau/như hình bên/hình dưới đây` bắt buộc phải có ảnh đi kèm, trừ khi công thức đã được viết lại đầy đủ bằng text.
- Các lựa chọn đúng/sai `a`, `b`, `c`, `d` phải viết hoa chữ cái đầu nội dung hiển thị, ví dụ `Thu được...`, không để `thu được...` ở đầu dòng.
- Công thức phân tử/cấu tạo trong lựa chọn phải dùng chỉ số dưới hoặc ký hiệu dễ đọc khi cần: `C₁₀H₁₅N₂`, `SO₄²⁻`, `H₂`; không để mất số, mất dấu điện tích hoặc dính vào chữ thường.
- Bảng dữ liệu khi render trong prompt phải có từng dòng riêng, ví dụ dòng tiêu đề `Cặp oxi hóa - khử ...` và dòng giá trị `Thế điện cực chuẩn ...`; không gộp cả bảng thành một câu dài.

## 5. Encoding và tiếng Việt

- Tất cả file dữ liệu đề, script import và tài liệu hướng dẫn phải dùng UTF-8.
- Sau khi import, kiểm tra các chữ có dấu dễ lỗi: `Đ`, `đ`, `ư`, `ơ`, `ă`, `â`, `ê`, `ô`, `ý`, `ệ`.
- Không chấp nhận text bị mojibake, ví dụ `GiÃºp`, `HÃ³a`, `ThÃ¡i NguyÃªn`.
- Nếu thấy lỗi encoding, sửa từ nguồn import hoặc script import, không vá từng chỗ rời rạc khi chưa hiểu nguyên nhân.

## 6. Import, seed và cập nhật dữ liệu

- Script import phải có khả năng chạy lại mà không phá dữ liệu đã chỉnh thủ công.
- Khi seed đề mẫu, không ghi đè `title`, `description`, `duration_minutes`, trạng thái active hoặc chỉnh sửa admin nếu không có chủ đích.
- Với dữ liệu đề tuần hoặc đề mẫu, nên dùng overlay/normalization ở runtime cho các sửa lỗi ổn định thay vì sửa tạm trong database rồi mất khi seed lại.
- Nếu cần cập nhật hàng loạt đáp án, tạo map đáp án rõ ràng theo `question_number` và kiểm tra số lượng câu trước khi update.
- Không block trang quản trị chỉ vì seed/import mất thời gian. Nếu seed có thể chậm, cần timeout hoặc chạy nền.

## 7. Trang quản trị đề

- Admin phải chỉnh được tối thiểu: tiêu đề, mô tả, thời lượng, trạng thái mở/đóng đề.
- Sau khi admin sửa cài đặt, reload trang để xác nhận dữ liệu không bị ghi đè.
- Với co-admin, kiểm tra quyền xem danh sách đề, xem chi tiết, sửa đề và xem kết quả.
- Nếu truy cập chi tiết đề không tồn tại hoặc không có quyền, phải redirect an toàn về danh sách đề, không crash.

## 8. Trang làm bài public

- Trước khi làm bài phải có màn hình bắt đầu, nhập tên học sinh và hiển thị thông tin đề.
- Bộ đếm thời gian phải bắt đầu khi học sinh bấm bắt đầu, không bắt đầu ngay khi page load nếu chưa vào bài.
- Draft bài làm nên lưu local để tránh mất dữ liệu khi reload.
- Khi hết giờ, hệ thống phải xử lý nộp bài hoặc chặn tiếp tục làm theo đúng logic hiện tại.
- Giao diện câu hỏi phải test trên desktop và mobile, đặc biệt với câu dài, bảng, công thức và hình.

## 9. Checklist trước khi public đề

- Mở trang admin và xác nhận đề xuất hiện đúng tên, mô tả, thời lượng.
- Mở trang làm bài public và xác nhận học sinh không thấy đáp án đúng.
- Làm thử ít nhất một bài với đáp án đúng toàn bộ để kiểm tra điểm tối đa.
- Làm thử một bài sai/một phần để kiểm tra chi tiết kết quả.
- Kiểm tra 3 nhóm câu: trắc nghiệm, đúng/sai, trả lời ngắn.
- Kiểm tra mọi câu có chữ `hình`, `sơ đồ`, `công thức cấu tạo` đều có asset tương ứng trong dữ liệu public.
- Với câu đúng/sai cuối mỗi phần, kiểm tra riêng lựa chọn `d` để chắc tiêu đề phần kế tiếp không bị kéo vào làm đáp án.
- Kiểm tra các câu có công thức, bảng, hình ảnh hoặc dữ kiện nhiều dòng.
- Với bảng/câu thế điện cực chuẩn, kiểm tra lại từng cặp oxi hóa - khử và giá trị `E°` so với file gốc, đặc biệt các câu có bảng bị Word tách dòng.
- Với câu có nhiều nhận định đánh số hoặc nhiều bước thí nghiệm, mở trang làm bài và xác nhận từng nhận định/bước nằm trên dòng riêng, không bị dính vào câu dẫn.
- Kiểm tra tiếng Việt không lỗi encoding.
- Kiểm tra reload trang admin không làm mất chỉnh sửa thủ công.
- Trước khi bật chấm tự động, trích đáp án từ phần `HƯỚNG DẪN GIẢI`/`Đáp án`/`Đáp số` của file gốc, sau đó kiểm tra đủ 28 câu: trắc nghiệm là key `A-D`, đúng/sai là object `a-d`, trả lời ngắn là chuỗi đã chuẩn hóa.

## 10. Quy tắc khi sửa lỗi đề đã public

- Xác định lỗi nằm ở dữ liệu gốc, script import, render, đáp án hay logic chấm điểm trước khi sửa.
- Nếu lỗi ảnh hưởng kết quả đã nộp, phải cân nhắc chấm lại hoặc ghi chú rõ phạm vi ảnh hưởng.
- Sửa ở nơi ổn định nhất: dữ liệu nguồn, script import, normalization runtime hoặc logic render/chấm điểm.
- Sau khi sửa, kiểm tra lại cả trang admin, trang public và trang kết quả.
- Ghi lại commit hoặc ghi chú thay đổi để lần sau biết lỗi nào đã được xử lý.
