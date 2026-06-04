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

function setPrompt(exam, questionNumber, prompt) {
  const question = exam.questions.find((item) => item.question_number === questionNumber);
  if (question) question.prompt = prompt;
}

for (const exam of exams) {
  exam.description =
    "Đề tuần 5 được nhập từ file Word gốc; câu hỏi, hình ảnh và đáp án đã được đối chiếu.";
  exam.subject = "Hóa học";
  exam.duration_minutes = 50;
  exam.is_active = true;

  if (exam.slugSuffix.includes("60-chuyen-khtn")) {
    setPrompt(
      exam,
      25,
      `Hợp chất KMnO₄ có thể được điều chế từ MnO₂ theo các bước sau:

Bước 1: Đun nóng hỗn hợp gồm KClO₃, KOH và 30,20 gam MnO₂ trong chén nickel để thực hiện phản ứng:
3MnO₂ + KClO₃ + 6KOH → 3K₂MnO₄ + KCl + 3H₂O (1)

Bước 2: Để nguội hỗn hợp, cho nước vào chén nickel, khuấy đều, lọc lấy phần dung dịch. Tiếp đó, sục khí Cl₂ dư vào dung dịch nước lọc:
2K₂MnO₄ + Cl₂ → 2KMnO₄ + 2KCl (2)

Bước 3: Làm lạnh để sản phẩm kết tinh, lọc thu lấy tinh thể, sấy khô, thu được 49,95 gam sản phẩm X gồm KMnO₄ có lẫn một lượng nhỏ KCl.

Để xác định hiệu suất tổng hợp và độ tinh khiết của sản phẩm KMnO₄ thu được ở trên, người ta hòa tan 1,6 gam X vào nước và định mức thành 50 mL dung dịch Y. Chuyển Y lên burette để thực hiện quá trình chuẩn độ 10,0 mL dung dịch H₂C₂O₄ 0,5M thì cần vừa đủ 10,0 mL dung dịch Y theo phản ứng:
5H₂C₂O₄ + 2KMnO₄ + 3H₂SO₄ → 10CO₂ + K₂SO₄ + 2MnSO₄ + 8H₂O (3)

Hiệu suất quá trình tổng hợp KMnO₄ và độ tinh khiết của KMnO₄ trong X lần lượt là x và y (x, y được làm tròn đến hàng đơn vị). Hãy tính tổng (x + y).

(KCl nồng độ nhỏ coi như không có phản ứng với dung dịch KMnO₄/H₂SO₄).`
    );

    setPrompt(
      exam,
      26,
      `Xăng RON₉₅ (chỉ số octane bằng 95) có khả năng chịu nén và chống kích nổ tương đương với hỗn hợp hơi xăng gồm 5% heptane (C₇H₁₆) và 95% iso-octane (C₈H₁₈) về thể tích. Năng suất tỏa nhiệt của một loại xăng RON₉₅ là a.10³ kJ/kg, giả thiết loại xăng này có tỉ lệ hơi xăng gồm 5% heptane và 95% iso-octane về thể tích.

Biến thiên enthalpy hình thành chuẩn của các chất được cho ở bảng dưới đây:

| Chất | C₇H₁₆(g) | C₈H₁₈(g) | CO₂(g) | H₂O(l) | O₂(g) |
| ΔfH°₂₉₈ (kJ/mol) | -187,8 | -224,2 | -393,5 | -285,8 | 0,0 |

Hãy tính giá trị của a. Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng đơn vị.`
    );

    setPrompt(
      exam,
      27,
      `Một nhà máy chuyên sản xuất thép (chứa 1% C theo khối lượng) với công nghệ lò luyện thép Martin. Sơ đồ phản ứng luyện thép trong lò là:
FeₓOᵧ + C → Fe + CO₂

Nguyên liệu nhà máy trên sử dụng để luyện thép gồm:
- Sắt phế liệu: chứa 50% Fe₃O₄, 49% Fe, 1% C theo khối lượng.
- Gang: chứa 5% khối lượng C, còn lại là Fe.

Một mẻ luyện thép cần 4 tấn gang và m tấn sắt phế liệu (hiệu suất của quá trình là 100%). Tính giá trị m. Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng phần mười.`
    );

    setPrompt(
      exam,
      28,
      "Cho m₁ gam dung dịch H₂SO₄ 91% hấp thụ hết m₂ gam SO₃ tạo thành một loại oleum (H₂SO₄.nSO₃) có chứa 50% khối lượng là SO₃. Tính tỉ lệ m₂/m₁. Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng phần mười."
    );

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
    setPrompt(
      exam,
      25,
      `Tiến hành các thí nghiệm sau:

(1) Sục khí CO₂ dư vào dung dịch Ca(OH)₂.
(2) Cho dung dịch NaOH dư vào dung dịch Ba(HCO₃)₂.
(3) Đun sôi một mẫu nước có tính cứng tạm thời.
(4) Cho dung dịch KHSO₄ vào dung dịch Ba(OH)₂.

Khi kết thúc phản ứng, số thí nghiệm thu được kết tủa là bao nhiêu?`
    );

    setPrompt(
      exam,
      27,
      `Thuốc aspirin thuộc nhóm thuốc kháng viêm non-steroid có tác dụng giảm đau, hạ sốt. Thuốc aspirin được tổng hợp từ các nguyên liệu theo phương trình hóa học trong hình (hiệu suất phản ứng tính theo salicylic acid là 60%).

Để sản xuất một lô thuốc aspirin gồm 10 triệu viên nén, mỗi viên nén chứa 81 mg aspirin, thì khối lượng salicylic acid cần dùng là bao nhiêu kg?`
    );

    setPrompt(
      exam,
      28,
      `Một nhà máy luyện kim sản xuất zinc (Zn) từ 60 tấn quặng zinc blende (chứa 80% ZnS về khối lượng, còn lại là tạp chất không chứa zinc) với hiệu suất cả quá trình đạt 95%. Phương trình hóa học được cho như sau:

2ZnS + 3O₂ → 2ZnO + 2SO₂
ZnO + C → Zn + CO

Toàn bộ lượng Zn tạo ra được đúc thành n thanh Zn hình hộp chữ nhật:
- Chiều dài: 120 cm.
- Chiều rộng: 25 cm.
- Chiều cao: 15 cm.

Biết khối lượng riêng của kẽm là 7,14 g/cm³, hãy xác định giá trị của n. Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng đơn vị.`
    );

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
