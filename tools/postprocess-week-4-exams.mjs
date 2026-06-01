import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examPath = path.join(root, "features/giup-cy/week-4-exams.json");
const assetPath = path.join(root, "features/giup-cy/week-4-assets.json");

const exams = JSON.parse(fs.readFileSync(examPath, "utf8"));
const assets = JSON.parse(fs.readFileSync(assetPath, "utf8"));

function capFirst(text) {
  const value = String(text ?? "").trim();
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("vi-VN") + value.slice(1);
}

for (const exam of exams) {
  exam.description =
    "Đề tuần 4 được nhập từ file Word gốc. Câu hỏi và hình ảnh được giữ theo nguồn; đáp án để rà soát trước khi bật chấm tự động.";
  exam.subject = "Hóa học";
  exam.duration_minutes = 50;
  exam.is_active = true;

  for (const item of exam.questions) {
    if (item.question_type === "true_false") {
      item.options = item.options.map((option) => ({
        ...option,
        text: capFirst(option.text),
      }));
    }
    item.correct_answer = null;
    item.needs_review = true;
    item.explanation =
      "Đề tuần 4 nhập từ Word; cần đối chiếu đáp án chính thức trước khi chấm tự động.";
  }

  if (exam.slugSuffix.includes("luong-the-vinh-lan-1-ha-noi")) {
    const q15 = exam.questions.find((item) => item.question_number === 15);
    if (q15) {
      q15.prompt = "Hợp chất C6H5CH2NH2 có tên thay thế là";
      q15.options = [
        { key: "A", text: "phenylamine." },
        { key: "B", text: "phenylmethanamine." },
        { key: "C", text: "benzylamine." },
        { key: "D", text: "benzenamine." },
      ];
    }
  }
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
