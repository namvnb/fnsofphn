import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examPath = path.join(root, "features/giup-cy/week-6-exams.json");
const assetPath = path.join(root, "features/giup-cy/week-6-assets.json");

const exams = JSON.parse(fs.readFileSync(examPath, "utf8"));
const assets = JSON.parse(fs.readFileSync(assetPath, "utf8"));

const explanation = "Đáp án đã đối chiếu từ phần hướng dẫn giải/đáp án trong file Word gốc.";

const keys = {
  "hoang-dieu-sao-nam-week-6": {
    1: "C",
    2: "A",
    3: "C",
    4: "A",
    5: "A",
    6: "D",
    7: "D",
    8: "B",
    9: "C",
    10: "A",
    11: "B",
    12: "C",
    13: "A",
    14: "B",
    15: "B",
    16: "C",
    17: "B",
    18: "C",
    19: { a: true, b: true, c: true, d: false },
    20: { a: true, b: false, c: true, d: true },
    21: { a: true, b: false, c: true, d: false },
    22: { a: true, b: true, c: false, d: true },
    23: "6",
    24: "4132",
    25: "234",
    26: "57,5",
    27: "23,6",
    28: "124"
  },
  "truong-phu-tho-week-6": {
    1: "C",
    2: "B",
    3: "D",
    4: "D",
    5: "B",
    6: "C",
    7: "D",
    8: "A",
    9: "C",
    10: "A",
    11: "D",
    12: "D",
    13: "B",
    14: "D",
    15: "D",
    16: "C",
    17: "C",
    18: "D",
    19: { a: false, b: false, c: true, d: true },
    20: { a: true, b: true, c: false, d: false },
    21: { a: true, b: false, c: true, d: false },
    22: { a: false, b: false, c: false, d: true },
    23: "153",
    24: "21",
    25: "2",
    26: "3",
    27: "14",
    28: "1345"
  }
};

function setPrompt(exam, questionNumber, prompt) {
  const question = exam.questions.find((item) => item.question_number === questionNumber);
  if (question) question.prompt = prompt;
}

function setOptions(exam, questionNumber, options) {
  const question = exam.questions.find((item) => item.question_number === questionNumber);
  if (question) question.options = options;
}

function choice(a, b, c, d) {
  return [
    { key: "A", text: a },
    { key: "B", text: b },
    { key: "C", text: c },
    { key: "D", text: d }
  ];
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
    "Đề tuần 6 được nhập từ file Word gốc; câu hỏi, hình ảnh và đáp án đã được đối chiếu.";
  exam.subject = "Hóa học";
  exam.duration_minutes = 50;
  exam.is_active = true;

  if (exam.slugSuffix === "truong-phu-tho-week-6") {
    setPrompt(
      exam,
      13,
      `Cho bảng nhiệt độ sôi (oC) đo ở áp suất 1 atm như sau:

Công thức chất | C2H5OH | CH3COOH | H2O | CH3COOC2H5 | H2SO4
Nhiệt độ sôi | 78,3 | 118 | 100 | 77 | 337

Ethyl acetate được điều chế bằng cách đun nóng hỗn hợp gồm acetic acid, ethanol và dung dịch H2SO4 98%, đựng trong bình cầu có nhánh. Nhiệt độ phản ứng được thiết lập ở 80 oC. Mô hình điều chế và tách ethyl acetate được thực hiện như hình. Phát biểu nào sau đây không đúng?`
    );
    setOptions(
      exam,
      13,
      choice(
        "H2SO4 đặc đóng vai trò vừa là chất xúc tác, vừa là chất hút nước, làm cân bằng phản ứng chuyển dịch theo chiều tạo ester, từ đó tăng hiệu suất phản ứng.",
        "Để tăng hiệu suất tách ethyl acetate khỏi lớp nước trong bình hứng có thể thêm dung dịch NaCl bão hòa.",
        "Phản ứng điều chế ethyl acetate từ ethanol và acetic acid (có mặt H2SO4 đặc) được gọi là phản ứng ester hóa.",
        "Ở 80 oC, phần hơi tách ra từ bình cầu có nhánh sang bình hứng chỉ gồm ethyl acetate và nước."
      )
    );

    setOptions(
      exam,
      20,
      tfOptions(
        "Trong phản ứng ở giai đoạn (2), anion C6H5COO- là một base theo thuyết Bronsted-Lowry.",
        "Giá trị của h là 43,5. (Kết quả làm tròn đến hàng phần mười).",
        "Trong phản ứng với KMnO4(aq) ở giai đoạn (1), toluene đóng vai trò là chất oxi hóa.",
        "Trên phổ hồng ngoại của benzoic acid, tín hiệu (peak) ở 1690 cm-1 đặc trưng cho liên kết O-H."
      )
    );

    setOptions(
      exam,
      22,
      tfOptions(
        "Khi giảm nồng độ ion kim loại trong dung dịch thì thế điện cực của kim loại không thay đổi.",
        "Cu đóng vai trò là cực âm (anode), Ni đóng vai trò là cực dương (cathode).",
        "Giá trị suất điện động của pin trên là Epin = Ecathode - Eanode = 0,597 V.",
        "A là cation K+ và B là anion NO3-."
      )
    );
  }

  const answerKey = keys[exam.slugSuffix] ?? {};
  for (const question of exam.questions) {
    question.correct_answer = answerKey[question.question_number] ?? null;
    question.needs_review = false;
    question.explanation = explanation;
  }
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
