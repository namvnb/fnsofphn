import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examPath = path.join(root, "features/giup-cy/week-5-exams.json");
const assetPath = path.join(root, "features/giup-cy/week-5-assets.json");

const exams = JSON.parse(fs.readFileSync(examPath, "utf8"));
const assets = JSON.parse(fs.readFileSync(assetPath, "utf8"));

const explanation = "Đáp án đã đối chiếu từ phần hướng dẫn giải/đáp án trong file Word gốc.";

const keys = {
  "60-chuyen-khtn-ha-noi-lan-2-thi-thu-tot-nghiep-thpt-removed-watermarked-week-5": {
    1: "D",
    2: "A",
    3: "B",
    4: "C",
    5: "B",
    6: "D",
    7: "A",
    8: "C",
    9: "C",
    10: "D",
    11: "A",
    12: "B",
    13: "D",
    14: "B",
    15: "D",
    16: "D",
    17: "D",
    18: "B",
    19: { a: true, b: true, c: false, d: false },
    20: { a: true, b: true, c: true, d: false },
    21: { a: false, b: true, c: true, d: false },
    22: { a: true, b: false, c: true, d: true },
    23: "4",
    24: "2",
    25: "189",
    26: "48",
    27: "3,2",
    28: "1,8"
  },
  "70-chuyen-tran-phu-lan-2-hai-phong-thi-thu-tot-nghiep-1-removed-watermarked-week-5": {
    1: "C",
    2: "A",
    3: "A",
    4: "B",
    5: "A",
    6: "A",
    7: "A",
    8: "D",
    9: "D",
    10: "C",
    11: "A",
    12: "B",
    13: "A",
    14: "B",
    15: "C",
    16: "B",
    17: "D",
    18: "D",
    19: { a: true, b: true, c: true, d: false },
    20: { a: false, b: true, c: true, d: true },
    21: { a: true, b: false, c: true, d: false },
    22: { a: false, b: false, c: true, d: true },
    23: "236",
    24: "16,2",
    25: "3",
    26: "194",
    27: "1035",
    28: "95"
  }
};

function capFirst(text) {
  const value = String(text ?? "").trim();
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("vi-VN") + value.slice(1);
}

function tfOptions(a, b, c, d) {
  return [
    { key: "a", text: a },
    { key: "b", text: b },
    { key: "c", text: c },
    { key: "d", text: d }
  ];
}

for (const exam of exams) {
  exam.description =
    "Đề tuần 5 được nhập từ file Word gốc; câu hỏi, hình ảnh và đáp án đã được đối chiếu.";
  exam.subject = "Hóa học";
  exam.duration_minutes = 50;
  exam.is_active = true;

  if (exam.slugSuffix.includes("60-chuyen-khtn")) {
    const q22 = exam.questions.find((item) => item.question_number === 22);
    if (q22) {
      q22.prompt =
        "Aniline là hóa chất được sử dụng nhiều trong lĩnh vực phẩm nhuộm, dược phẩm. Trong phòng thí nghiệm, quá trình điều chế aniline từ nitrobenzene được thực hiện theo sơ đồ phản ứng trong hình.";
      q22.options = tfOptions(
        "Trong phản ứng khử nitrobenzene bằng (Zn + HCl), tác nhân khử là hydrogen mới sinh [H].",
        "Trong phản ứng ở giai đoạn (2), cation C6H5NH3+ là một base theo thuyết Bronsted-Lowry.",
        "Theo sơ đồ tổng hợp aniline ở trên, từ 61,5 gam nitrobenzene có thể thu được 37,2 gam aniline, với hiệu suất của quá trình tổng hợp aniline từ nitrobenzene là 80%.",
        "Phương pháp có thể sử dụng để tách aniline ra khỏi hỗn hợp sau kiềm hóa là phương pháp chiết lỏng-lỏng; aniline dễ dàng được chiết tách ra khỏi pha nước bằng các dung môi hữu cơ như ether, benzene hoặc dichloromethane."
      );
    }
  }

  if (exam.slugSuffix.includes("70-chuyen-tran-phu")) {
    const q21 = exam.questions.find((item) => item.question_number === 21);
    if (q21) {
      q21.prompt =
        "Hyaluronic acid (HA) là một polysaccharide quan trọng trong cơ thể người, tập trung nhiều ở dịch khớp, thủy tinh thể và da. HA đóng vai trò là chất bôi trơn và khả năng dưỡng ẩm sâu. Hình ảnh dưới đây mô tả cấu tạo một đoạn mạch của HA, gồm các đơn vị lặp lại là disaccharide của D-glucuronic acid và N-acetyl-D-glucosamine liên kết xen kẽ với nhau. Biết một mắt xích disaccharide của HA có công thức phân tử C14H21NO11.";
      q21.options = tfOptions(
        "HA tồn tại ở dạng polyanion (tích điện âm) trong điều kiện sinh lí cơ thể (pH ~ 7,4).",
        "Trong phân tử HA, các đơn vị monosaccharide chỉ liên kết với nhau bằng liên kết beta-1,4-glycoside.",
        "HA là một polymer thiên nhiên thuộc loại polysaccharide tạp chức.",
        "Một nhà máy dược phẩm sản xuất thuốc nhỏ mắt chứa sodium hyaluronate nồng độ 0,1% (khối lượng/thể tích); từ 1 kg nguyên liệu thô chứa 2,5% sodium hyaluronate về khối lượng và hiệu suất toàn bộ quá trình đạt 80%, nhà máy thu được 2500 lọ thuốc nhỏ mắt loại 10 mL."
      );
    }

    const q22 = exam.questions.find((item) => item.question_number === 22);
    if (q22) {
      q22.options = tfOptions(
        "Nồng độ ion H+ của nước bể bơi đo được ở bước 2 gấp 2,51 lần nồng độ ion H+ của dung dịch chuẩn có pH = 10,01.",
        "Nước trong bể bơi tại thời điểm đo đang ở trạng thái không an toàn.",
        "Biết rằng, giá trị sức điện động phụ thuộc tuyến tính vào pH dung dịch theo dạng phương trình y = ax + b. Ở bước 2, sức điện động mà máy đo ghi nhận được có giá trị xấp xỉ -23,6 mV.",
        "Ở bước 1, sức điện động của hệ có xu hướng giảm khi nồng độ H+ trong dung dịch giảm."
      );
    }
  }

  const answerKey = keys[exam.slugSuffix] ?? {};
  for (const item of exam.questions) {
    if (item.question_type === "true_false") {
      item.options = item.options.map((option) => ({
        ...option,
        text: capFirst(option.text)
      }));
    }
    item.correct_answer = answerKey[item.question_number] ?? null;
    item.needs_review = false;
    item.explanation = explanation;
  }
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
