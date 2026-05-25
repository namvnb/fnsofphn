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
- Điểm phải khớp cấu trúc đề thi. Ví dụ trắc nghiệm thường `0.25`, đúng/sai thường `1`, trả lời ngắn thường `0.25` nếu theo format hiện tại.

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
  - Mũ, phần trăm, dấu âm, dấu phẩy thập phân.
- Không để công thức bị dính chữ hoặc mất chỉ số. Nếu công thức khó render, cần kiểm tra qua `FormattedText`.
- Bảng dữ liệu phải giữ hàng/cột rõ ràng. Nếu bảng từ Word bị vỡ, chuyển thành Markdown table hoặc text có dòng phân tách dễ đọc.
- Với hình ảnh/sơ đồ, phải kiểm tra asset tồn tại, render được và nằm đúng câu hỏi.

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
- Kiểm tra các câu có công thức, bảng, hình ảnh hoặc dữ kiện nhiều dòng.
- Kiểm tra tiếng Việt không lỗi encoding.
- Kiểm tra reload trang admin không làm mất chỉnh sửa thủ công.

## 10. Quy tắc khi sửa lỗi đề đã public

- Xác định lỗi nằm ở dữ liệu gốc, script import, render, đáp án hay logic chấm điểm trước khi sửa.
- Nếu lỗi ảnh hưởng kết quả đã nộp, phải cân nhắc chấm lại hoặc ghi chú rõ phạm vi ảnh hưởng.
- Sửa ở nơi ổn định nhất: dữ liệu nguồn, script import, normalization runtime hoặc logic render/chấm điểm.
- Sau khi sửa, kiểm tra lại cả trang admin, trang public và trang kết quả.
- Ghi lại commit hoặc ghi chú thay đổi để lần sau biết lỗi nào đã được xử lý.

