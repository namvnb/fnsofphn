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

function updateQuestion(exam, questionNumber, patch) {
  const question = exam.questions.find((item) => item.question_number === questionNumber);
  if (question) Object.assign(question, patch);
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

function normalizeAnswer(answer) {
  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    return ["a", "b", "c", "d"].map((key) => (answer[key] ? "T" : "F")).join("");
  }
  return answer ?? null;
}

function cleanChemistryText(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\bE\s*o\b/g, "E°")
    .replace(/\bCu\s*2\+\s*\/\s*Cu\b/g, "Cu²⁺/Cu")
    .replace(/\bFe\s*2\+\s*\/\s*Fe\b/g, "Fe²⁺/Fe")
    .replace(/\bNi\s*2\+\s*\/\s*Ni\b/g, "Ni²⁺/Ni")
    .replace(/\bZn\s*2\+\s*\/\s*Zn\b/g, "Zn²⁺/Zn")
    .replace(/\bAg\s*\+\s*\/\s*Ag\b/g, "Ag⁺/Ag")
    .replace(/\bCu\s*2\+/g, "Cu²⁺")
    .replace(/\bFe\s*2\+/g, "Fe²⁺")
    .replace(/\bFe\s*3\+/g, "Fe³⁺")
    .replace(/\bNi\s*2\+/g, "Ni²⁺")
    .replace(/\bZn\s*2\+/g, "Zn²⁺")
    .replace(/\bAg\s*\+/g, "Ag⁺")
    .replace(/\bMg\s*2\+/g, "Mg²⁺")
    .replace(/\bCa\s*2\+/g, "Ca²⁺")
    .replace(/\bAl\s*3\+/g, "Al³⁺")
    .replace(/\bK\s*\+/g, "K⁺")
    .replace(/\bNa\s*\+/g, "Na⁺")
    .replace(/\bH\s*\+/g, "H⁺")
    .replace(/\bSO\s*4\s*2-/g, "SO₄²⁻")
    .replace(/\bCO\s*3\s*2-/g, "CO₃²⁻")
    .replace(/\bNO\s*3-/g, "NO₃⁻")
    .replace(/\bHCO\s*3-/g, "HCO₃⁻")
    .replace(/\bMnO\s*4-/g, "MnO₄⁻")
    .replace(/\bCuSO\s*4\b/g, "CuSO₄")
    .replace(/\bHNO\s*3\b/g, "HNO₃")
    .replace(/\bH\s*2SO\s*4\b/g, "H₂SO₄")
    .replace(/\bMgCl\s*2\b/g, "MgCl₂")
    .replace(/\bKCl\.MgCl₂\s*\.\s*6H\s*2\s*O\b/g, "KCl.MgCl₂.6H₂O")
    .replace(/\bC\s*6\s*H\s*12\s*O\s*6\b/g, "C₆H₁₂O₆")
    .replace(/\bC\s*3\s*H\s*6\s*O\s*3\b/g, "C₃H₆O₃")
    .replace(/\bC\s*2\s*H\s*5OH\b/g, "C₂H₅OH")
    .replace(/\bC\s*2\s*H\s*4\s*O\s*3\b/g, "C₂H₄O₃")
    .replace(/\bAl\s*2O\s*3\b/g, "Al₂O₃")
    .replace(/\bFe\s*3O\s*4\b/g, "Fe₃O₄")
    .replace(/\bFe\s*2O\s*3\b/g, "Fe₂O₃")
    .replace(/\bH\s*2O\b/g, "H₂O")
    .replace(/\bH\s*2\b/g, "H₂")
    .replace(/\bO\s*2\b/g, "O₂")
    .replace(/\bN\s*2\b/g, "N₂")
    .replace(/\bCl\s*2\b/g, "Cl₂")
    .replace(/\bCO\s*2\b/g, "CO₂")
    .replace(/\bNO\s*2\b/g, "NO₂")
    .replace(/\bSO\s*2\b/g, "SO₂")
    .replace(/\bSO\s*3\b/g, "SO₃")
    .replace(/\bNH\s*3\b/g, "NH₃")
    .replace(/\bNH\s*4/g, "NH₄")
    .replace(/\bHCO\s*3\b/g, "HCO₃")
    .replace(/\bCO\s*3\b/g, "CO₃")
    .replace(/\bSO\s*4\b/g, "SO₄")
    .replace(/\bNO\s*3\b/g, "NO₃")
    .replace(/\bCH\s*3\b/g, "CH₃")
    .replace(/\bCH\s*2\b/g, "CH₂");
}

function moveSharedAssets(assetEntry, fromQuestion, toQuestions) {
  const assetsForQuestion = assetEntry?.questionAssets?.[fromQuestion];
  if (!assetsForQuestion) return;
  for (const questionNumber of toQuestions) {
    assetEntry.questionAssets[questionNumber] = assetsForQuestion;
  }
  delete assetEntry.questionAssets[fromQuestion];
}

for (const exam of exams) {
  exam.description =
    "Đề tuần 6 được nhập từ file Word gốc; câu hỏi, hình ảnh và đáp án đã được đối chiếu.";
  exam.subject = "Hóa học";
  exam.duration_minutes = 50;
  exam.is_active = true;

  if (exam.slugSuffix === "hoang-dieu-sao-nam-week-6") {
    setOptions(
      exam,
      1,
      choice("C₁₅H₃₁COONa.", "C₁₅H₃₁COOCH₃.", "CH₃[CH₂]₁₁OSO₃Na.", "CH₃COOK.")
    );

    setPrompt(
      exam,
      6,
      `Cho khối lượng riêng của các chất như bảng sau:

Chất | Li | Na | K | Ca | Dầu hỏa
Khối lượng riêng (g/mL) | 0,53 | 0,97 | 0,86 | 1,54 | 0,80

Để bảo quản một số kim loại mạnh, người ta thường ngâm chìm kim loại đó trong dầu hỏa. Trong số các kim loại trên, có bao nhiêu kim loại bảo quản được trong dầu hỏa?`
    );

    setOptions(
      exam,
      7,
      choice(
        "Tất cả các kim loại nhóm IA đều tan tốt trong nước ở nhiệt độ thường.",
        "Nước chứa nhiều ion Ca²⁺, Mg²⁺, HCO₃⁻, Cl⁻, SO₄²⁻ thuộc loại nước có tính cứng toàn phần.",
        "Kim loại nhóm IA đều có cấu trúc mạng tinh thể lập phương tâm khối.",
        "Sự tạo thành thạch nhũ trong hang động là do CaCO₃ bị phân hủy thành CaO."
      )
    );

    setPrompt(
      exam,
      11,
      `Hạt nhân ²³⁸₉₂U sau một chuỗi các quá trình phóng xạ α (⁴₂He) và β⁻ (⁰₋₁e) liên tiếp biến đổi thành hạt nhân ²⁰⁶₈₂Pb bền theo phương trình chuỗi phản ứng:

²³⁸₉₂U → ²⁰⁶₈₂Pb + x⁴₂He + y⁰₋₁e

Trong đó, x và y lần lượt là số lần phóng xạ α và β trong chuỗi phóng xạ. Tất cả các phản ứng hạt nhân đều tuân theo định luật bảo toàn số khối và điện tích. Giá trị của y là`
    );

    setPrompt(
      exam,
      10,
      `Trong quá trình Solvay, ở giai đoạn tạo thành NaHCO₃ tồn tại cân bằng sau:

NaCl(aq) + NH₃(aq) + CO₂(g) + H₂O(l) ⇌ NaHCO₃(s) + NH₄Cl(aq)

Khi làm lạnh dung dịch trên, muối bị tách ra khỏi dung dịch là`
    );
    setOptions(exam, 10, choice("NaHCO₃.", "NH₄Cl.", "NaCl.", "NH₄HCO₃."));


    setPrompt(
      exam,
      12,
      `Trong công nghiệp năng lượng, hydrogen (H₂) được sản xuất từ khí tổng hợp thông qua phản ứng water gas shift (WGS):

CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)
ΔrH°₂₉₈ = -41,2 kJ/mol

Khảo sát ảnh hưởng của tỉ lệ hơi nước/CO (R) lên độ chuyển hóa của CO theo nhiệt độ được biểu diễn qua đồ thị bên cạnh.

Phát biểu nào sau đây đúng?`
    );

    setOptions(
      exam,
      12,
      choice(
        "Phản ứng trên là phản ứng thu nhiệt.",
        "Khi tăng áp suất, phản ứng trên chuyển dịch theo chiều thuận.",
        "Khi R tăng thì tỉ lệ chuyển hóa của CO tăng.",
        "Khi tăng nhiệt độ, tốc độ phản ứng giảm."
      )
    );

    setOptions(
      exam,
      13,
      choice(
        "X tác dụng với dung dịch NaOH theo tỉ lệ mol nX : nNaOH = 1 : 5.",
        "Trong phân tử X có 4 liên kết peptide.",
        "Amino acid đầu C của peptide X là valine.",
        "X phản ứng được với Cu(OH)₂ trong môi trường kiềm tạo dung dịch màu tím đặc trưng."
      )
    );

    setPrompt(
      exam,
      15,
      `Cho biết Mg (Z = 12) và Al (Z = 13) là những kim loại quen thuộc. Hợp kim 5005 chứa 99,2% Al và 0,8% Mg theo khối lượng, được ứng dụng làm vật liệu kim loại nhờ các đặc tính như nhẹ và bền.

Cho các nhận định sau:
(a) Bán kính nguyên tử của Mg lớn hơn bán kính nguyên tử của Al.
(b) Trong hợp kim 5005, tỉ lệ số nguyên tử Al : Mg bằng 124 : 1.
(c) Do đặc tính bền và nhẹ nên hợp kim 5005 được ứng dụng trong kiến trúc (ốp mặt tiền, trần nhà,...).
(d) Hợp kim 5005 không bị ăn mòn trong dung dịch acid hoặc kiềm.

Các nhận định đúng là`
    );

    setPrompt(
      exam,
      16,
      `Có 5 kim loại X, Y, Z, T, Q, tất cả đều có hóa trị II. Tiến hành thí nghiệm như sau:

Thí nghiệm 1: Cho 5 kim loại vào dung dịch hydrochloric acid. Chỉ có Q không có phản ứng, 4 kim loại còn đều có hiện tượng sủi bọt khí.
Thí nghiệm 2: Kim loại X, Y không phản ứng với dung dịch Z²⁺.
Thí nghiệm 3: Từ 5 kim loại trên, thiết lập các pin điện hóa dạng M(s)/M²⁺(aq)//N²⁺(aq)/N(s). Pin có suất điện động chuẩn lớn nhất là pin của T-Q.

Cho các phát biểu sau:
(1) T là kim loại có tính khử mạnh nhất.
(2) Z²⁺ có tính oxi hóa mạnh nhất trong các ion của 5 kim loại trên.
(3) Q có tính oxi hóa mạnh hơn Y.
(4) Thế điện cực chuẩn của cặp X²⁺/X lớn hơn Q²⁺/Q.
(5) Thế điện cực chuẩn của cặp Y²⁺/Y lớn hơn Z²⁺/Z.

Số phát biểu sai là`
    );

    const petContext = `Sử dụng thông tin dưới đây để trả lời câu 17 và câu 18:

Nhựa PET (poly(ethylene terephthalate), kí hiệu số 1 như hình bên) là một polymer được điều chế từ terephthalic acid và ethylene glycol. PET được sử dụng để làm chai lọ, bao bì nhưng rất khó phân hủy trong tự nhiên.

Gần đây, các nhà khoa học đã phát hiện chủng vi khuẩn Ideonella sakaiensis có khả năng tiết ra enzyme phân hủy loại nhựa này.

Để nghiên cứu tốc độ phân hủy nhựa PET, người ta cho một mảnh nhựa PET dạng tấm hình vuông (cạnh 4,0 cm, độ dày 0,03 cm và khối lượng riêng 1,45 g/cm³) vào một bể chứa lượng lớn vi khuẩn Ideonella sakaiensis. Do mật độ vi khuẩn lớn, chúng bám kín toàn bộ bề mặt của mảnh nhựa nên tốc độ phân hủy nhựa PET đạt mức cực đại và gần như không đổi. Thực nghiệm xác định khối lượng nhựa bị phân hủy trung bình là 8,12 mg/ngày. Sau 12 ngày liên tục, mảnh nhựa trên đã bị vi khuẩn phân hủy a% về khối lượng.

Thực hiện thí nghiệm tương tự với những mảnh nhựa PET có độ kết tinh khác nhau, thu được kết quả như đồ thị bên cạnh.`;

    setPrompt(
      exam,
      17,
      `${petContext}

Giá trị của a bằng bao nhiêu? (Không làm tròn các phép tính trung gian, kết quả cuối cùng làm tròn đến hàng phần mười.)`
    );

    setPrompt(
      exam,
      18,
      `${petContext}

Cho các phát biểu sau về nhựa PET:
(1) Phản ứng tổng hợp PET từ terephthalic acid và ethylene glycol thuộc loại phản ứng trùng ngưng.
(2) PET rất khó phân hủy trong tự nhiên vì bền trong môi trường acid.
(3) Tơ được chế tạo từ PET thuộc loại tơ bán tổng hợp.
(4) Số 1 trong kí hiệu nhận dạng cho biết đồ dùng làm từ PET chỉ sử dụng một lần.
(5) Độ kết tinh của nhựa và tốc độ phân hủy tỉ lệ thuận với nhau.

Số nhận định đúng là`
    );

    setPrompt(
      exam,
      19,
      `Áp dụng kiến thức về các yếu tố ảnh hưởng đến tốc độ phản ứng trong phần tổng hợp ester, một nhóm học sinh dự đoán: "Nhiệt độ càng cao, hiệu suất ester hóa càng cao". Để kiểm chứng, nhóm tiến hành phản ứng tổng hợp propyl acetate từ alcohol và acid tương ứng với nồng độ không đổi ở các nhiệt độ khác nhau:

CH₃COOH + CH₃CH₂CH₂OH ⇌ CH₃COOCH₂CH₂CH₃ + H₂O (1)

Kết quả thu được:
Nhiệt độ (oC) | 60 | 65 | 70 | 75 | 80 | 85
Thể tích ester (mL) | 26,0 | 30,5 | 35,0 | 40,0 | 36,5 | 31,0

Độ tan trong 100 gam nước ở 25 oC:
Chất | CH₃COOH | CH₃CH₂CH₂OH | CH₃COOCH₂CH₂CH₃
Độ tan (gam) | Vô hạn | Vô hạn | 1,6`
    );

    setOptions(
      exam,
      19,
      tfOptions(
        "Từ kết quả trên, dự đoán của học sinh là sai.",
        "Trong phản ứng (1), H₂O được tạo thành từ -OH của acid và -H của alcohol.",
        "Có thể dùng phương pháp chiết lỏng-lỏng để tách CH₃COOCH₂CH₂CH₃ ra khỏi hỗn hợp sản phẩm.",
        "Vì CH₃COOH và CH₃CH₂CH₂OH đều có nhóm -OH nên không thể dùng phương pháp phổ hồng ngoại (IR) để nhận biết hai chất trên."
      )
    );

    setOptions(
      exam,
      20,
      tfOptions(
        "Tại cathode xảy ra quá trình khử.",
        "Khí trơ được sử dụng trong quá trình điện phân trên là khí nitrogen.",
        "Khối lượng riêng của kim loại Mg nóng chảy nhỏ hơn khối lượng riêng của hỗn hợp MgCl₂ và KCl nóng chảy.",
        "Bằng phương pháp trên, nếu dùng 1 tấn quặng carnalite (chứa 43% KCl.MgCl₂.6H₂O về khối lượng, còn lại là tạp chất không chứa magnesium) với hiệu suất cả quá trình sản xuất là 75% thì thu được 27,9 kg magnesium. (Kết quả làm tròn đến hàng phần mười.)"
      )
    );

    setOptions(
      exam,
      21,
      tfOptions(
        "Phản ứng tổng quát xảy ra trong bộ chuyển đổi xúc tác là CxHy + NOa → H₂O + CO₂ + N₂.",
        "Hàm lượng khí thải chứa nhiều CO₂ là nguyên nhân chính gây ra hiện tượng mưa acid.",
        "CO là một khí độc, người hít nhiều khí CO sẽ làm giảm khả năng vận chuyển oxygen dẫn đến bị chết ngạt.",
        "Một xe ô tô chạy 100 km tiêu thụ hết 5 L xăng (coi như xăng chỉ chứa C₈H₁₈), với khối lượng riêng 0,8 g/mL. Quá trình cháy hoàn toàn lượng xăng nói trên tạo ra hỗn hợp khí thải chứa tỉ lệ số mol nCO₂ : nCO : nNO = 8 : 2 : 3. Thể tích khí oxygen đã tham gia vào các phản ứng trên (đkc) bằng 11221 lít. (Không làm tròn các phép tính trung gian, kết quả làm tròn đến hàng đơn vị.)"
      )
    );

    setPrompt(
      exam,
      22,
      `Một nhóm học sinh thiết lập pin điện hóa với điện cực Cuᵃ⁺/Cu và Ag⁺/Ag ở điều kiện chuẩn theo sơ đồ trong hình.

Các giá trị thế điện cực chuẩn của một số cặp oxi hóa-khử:
Bán phản ứng | E° (V)
Cu²⁺(aq) + 1e → Cu⁺(aq) | +0,15
Cu⁺(aq) + 1e → Cu(s) | +0,52
Cu²⁺(aq) + 2e → Cu(s) | +0,34
Ag⁺(aq) + 1e → Ag(s) | +0,80`
    );

    setOptions(
      exam,
      22,
      tfOptions(
        "Khi pin hoạt động, điện cực Ag luôn đóng vai trò là cathode.",
        "Với a = 2, sức điện động chuẩn của pin đo được bằng 0,46 V.",
        "Khi pin hoạt động sẽ phát sinh dòng điện do sự di chuyển của các ion trong cầu muối về các điện cực.",
        "Cầu muối có vai trò khép kín mạch điện và trung hòa điện tích ở hai điện cực."
      )
    );

    setPrompt(
      exam,
      24,
      `Thực hiện các thí nghiệm được đánh số theo thứ tự sau:

(1) Cho 2 mL dung dịch NaOH 10% vào ống nghiệm, thêm 0,5 mL dung dịch CuSO₄ 5%, lắc nhẹ. Thêm tiếp 3 mL dung dịch saccharose 5% vào ống nghiệm, lắc đều.
(2) Cho khoảng 2 mL dung dịch NaOH 10% và khoảng 0,5 mL dung dịch CuSO₄ 5% vào ống nghiệm, lắc nhẹ. Cho tiếp khoảng 3 mL dung dịch glucose 2% vào ống nghiệm và lắc đều. Đun nóng nhẹ hỗn hợp trên ngọn lửa đèn cồn vài phút.
(3) Cho khoảng 1 mL nước bromine vào ống nghiệm, sau đó thêm vài giọt aniline loãng.
(4) Cho vào ống nghiệm khoảng 1 mL dung dịch I₂ trong KI và khoảng 1 mL dung dịch NaOH 10%. Nhỏ từ từ 5 giọt acetaldehyde vào ống nghiệm, lắc đều.

Gán số thứ tự của thí nghiệm trên tương ứng với các hiện tượng a, b, c, d:
(a) Xuất hiện kết tủa màu vàng.
(b) Xuất hiện dung dịch màu xanh lam.
(c) Xuất hiện kết tủa màu trắng.
(d) Xuất hiện kết tủa đỏ gạch.`
    );

    setPrompt(
      exam,
      25,
      `Thực hiện các thí nghiệm sau:

(1) Cho một dây zinc (Zn) sạch vào ống nghiệm chứa 2 mL dung dịch HCl 0,2 M.
(2) Cho một dây zinc (Zn) sạch vào ống nghiệm chứa 2 mL dung dịch HCl 0,2 M, nhỏ thêm vài giọt dung dịch CuSO₄.
(3) Quấn sợi dây đồng trên một đinh sắt, sau đó nhúng vào cốc đựng 2 mL dung dịch NaCl.
(4) Cho một đoạn dây thép vào ống nghiệm chứa 2 mL dung dịch HCl 0,2 M.
(5) Cho một dây bạc sạch vào ống nghiệm chứa 2 mL dung dịch CuSO₄ 0,2 M.

Liệt kê theo thứ tự tăng dần số thí nghiệm xuất hiện ăn mòn điện hóa.`
    );

    setPrompt(
      exam,
      27,
      `Có hai dung dịch X và Y, mỗi dung dịch chỉ chứa hai loại cation và hai loại anion trong số các ion sau (X, Y không chứa cùng loại ion):

Ion | K⁺ | Mg²⁺ | Na⁺ | H⁺ | HCO₃⁻ | SO₄²⁻ | NO₃⁻ | CO₃²⁻
Số mol | 0,15 | 0,2 | 0,25 | 0,15 | 0,1 | 0,15 | 0,25 | 0,15

Biết dung dịch Y hòa tan được Fe₂O₃. Nếu đun đến cạn dung dịch X thì thu được m gam chất rắn khan. Giá trị m là bao nhiêu? (Kết quả làm tròn đến hàng phần mười.)`
    );

    setPrompt(
      exam,
      28,
      `Muối Mohr là một dạng muối kép có tác dụng chống lại quá trình oxi hóa bằng không khí. Muối Mohr được tạo thành từ hỗn hợp E cùng số mol gồm iron(II) sulfate ngậm 7 phân tử nước và ammonium sulfate khan. Cân 7,35 gam muối Mohr trên rồi hòa tan vào nước, sau đó định mức trong bình 50 mL.

Chuẩn độ 5 mL dung dịch vừa pha cần dùng 12,5 mL dung dịch KMnO₄ 0,03 M trong môi trường H₂SO₄ loãng, dư theo phương trình:

Fe²⁺ + MnO₄⁻ + H⁺ → Fe³⁺ + Mn²⁺ + H₂O (1)

Từ m gam E người ta điều chế muối Mohr với hiệu suất 65%; hòa tan muối Mohr này vào nước thu được dung dịch F. Hạ dần nhiệt độ F xuống 20 oC thu được 74,93 gam dung dịch và 31,2 gam muối Mohr kết tinh. Cho biết độ tan muối Mohr ở 20 oC là 27 gam. (Chỉ làm tròn đến phép tính cuối cùng, các kết quả làm tròn đến hàng phần mười.)

Cho các phát biểu sau:
(1) Giá trị của m bằng 75,8.
(2) Phần trăm khối lượng của Fe trong muối Mohr tạo thành ở trên bằng 14,3%.
(3) Tổng hệ số cân bằng (nguyên, tối giản) trong phản ứng (1) bằng 24.
(4) Để bảo quản muối Mohr, có thể bảo quản trong dung dịch có môi trường kiềm.

Liệt kê các phát biểu đúng theo số thứ tự tăng dần.`
    );
  }

  if (exam.slugSuffix === "truong-phu-tho-week-6") {
    setPrompt(
      exam,
      1,
      "Cho biết: E°(Fe²⁺/Fe) = -0,440 V; E°(Cu²⁺/Cu) = +0,340 V. Sức điện động chuẩn của pin điện hóa Fe-Cu là"
    );

    setOptions(exam, 5, choice("CH₃COOC₂H₅.", "CH₃COOCH₃.", "HCOOCH₃.", "HCOOC₂H₅."));

    setPrompt(
      exam,
      2,
      `Một pin Galvani được cấu tạo bởi hai cặp oxi hóa-khử sau:

Cặp oxi hóa-khử | Bán phản ứng | E° (V)
Ag⁺/Ag | Ag⁺ + 1e → Ag | +0,799
Ni²⁺/Ni | Ni²⁺ + 2e → Ni | -0,257

Khi pin làm việc ở điều kiện chuẩn, nhận định nào sau đây là đúng?`
    );
    setOptions(
      exam,
      2,
      choice(
        "Ag được tạo ra ở cực dương, Ni được tạo ra ở cực âm.",
        "Ag được tạo ra ở cực dương, Ni²⁺ được tạo ra ở cực âm.",
        "Ag⁺ được tạo ra ở cực âm và Ni được tạo ra ở cực dương.",
        "Ag được tạo ra ở cực âm và Ni²⁺ được tạo ra ở cực dương."
      )
    );

    setOptions(
      exam,
      7,
      choice(
        "Các electron hóa trị nằm ở giữa các nguyên tử kim loại cạnh nhau.",
        "Các electron hóa trị ở các nút mạng và các ion dương kim loại chuyển động tự do.",
        "Các electron hóa trị và các ion dương kim loại chuyển động tự do trong toàn bộ mạng tinh thể.",
        "Các ion dương kim loại nằm ở các nút mạng tinh thể và các electron hóa trị chuyển động tự do xung quanh."
      )
    );

    setPrompt(
      exam,
      9,
      `Phản ứng hóa học của ethylene với HCl được cho bởi phương trình:

CH₂=CH₂ + HCl → CH₃CH₂Cl (*)

Cơ chế phản ứng và giản đồ năng lượng được đề xuất cho phản ứng trên như hình.

Nhận định nào sau đây không đúng?`
    );
    setOptions(
      exam,
      9,
      choice(
        "Phản ứng (*) là phản ứng thu nhiệt.",
        "Sản phẩm hữu cơ thu được có tên thay thế là chloroethane.",
        "Liên kết C-Cl trong phân tử CH₃CH₂Cl là liên kết σ, được hình thành do sự xen phủ trục của các obitan nguyên tử.",
        "Ở giai đoạn 1 của phản ứng xảy ra sự proton hóa liên kết đôi C=C, tạo thành carbocation."
      )
    );

    setPrompt(
      exam,
      13,
      `Cho bảng nhiệt độ sôi (oC) đo ở áp suất 1 atm như sau:

Công thức chất | C₂H₅OH | CH₃COOH | H₂O | CH₃COOC₂H₅ | H₂SO₄
Nhiệt độ sôi | 78,3 | 118 | 100 | 77 | 337

Ethyl acetate được điều chế bằng cách đun nóng hỗn hợp gồm acetic acid, ethanol và dung dịch H₂SO₄ 98%, đựng trong bình cầu có nhánh. Nhiệt độ phản ứng được thiết lập ở 80 oC. Mô hình điều chế và tách ethyl acetate được thực hiện như hình.

Nhận định nào sau đây không đúng?`
    );
    setOptions(
      exam,
      13,
      choice(
        "H₂SO₄ đặc đóng vai trò vừa là chất xúc tác, vừa là chất hút nước, làm cân bằng phản ứng chuyển dịch theo chiều tạo ester, từ đó tăng hiệu suất phản ứng.",
        "Để tăng hiệu suất tách ethyl acetate khỏi lớp nước trong bình hứng có thể thêm dung dịch NaCl bão hòa.",
        "Phản ứng điều chế ethyl acetate từ ethanol và acetic acid (có mặt H₂SO₄ đặc) được gọi là phản ứng ester hóa.",
        "Ở 80 oC, phần hơi tách ra từ bình cầu có nhánh sang bình hứng chỉ gồm ethyl acetate và nước."
      )
    );

    setPrompt(
      exam,
      15,
      "Phản ứng nào sau đây là phản ứng thu nhiệt?"
    );

    setPrompt(exam, 14, "Tên thay thế của amine CH₃-NH-CH₂-CH₂-CH₃ là");
    setOptions(
      exam,
      14,
      choice("methylpropylamine.", "N-propylmethanamine.", "N-methylpropan-3-amine.", "N-methylpropan-1-amine.")
    );
    setOptions(
      exam,
      15,
      choice(
        "NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l); ΔrH°₂₉₈ = -57,9 kJ.",
        "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l); ΔrH°₂₉₈ = -890,36 kJ.",
        "C₃H₈(g) + 5O₂(g) → 3CO₂(g) + 4H₂O(l); ΔrH°₂₉₈ = -2220 kJ.",
        "ZnSO₄(s) → ZnO(s) + SO₂(g); ΔrH°₂₉₈ = +235,21 kJ."
      )
    );

    setOptions(
      exam,
      17,
      choice(
        "Ở pH = 6, X hầu như không di chuyển trong điện trường.",
        "Có 2 α-amino acid đồng phân cấu tạo ứng với công thức phân tử của X.",
        "Các amino acid đồng phân cấu tạo với X đều là amino acid thiết yếu đối với cơ thể người.",
        "Công thức phân tử của X là C₄H₉O₂N."
      )
    );

    setOptions(
      exam,
      21,
      tfOptions(
        "Khi cho a mol T tác dụng với Na dư, thu được a mol khí H₂.",
        "Chất X tác dụng được với Cu(OH)₂ ở điều kiện thường, tạo dung dịch màu xanh lam.",
        "Ở điều kiện thường, F tồn tại ở trạng thái khí.",
        "Chất E có ba cấu tạo thỏa mãn."
      )
    );

    setPrompt(
      exam,
      19,
      `Sulfur dioxide (SO₂) tác dụng với nitrogen dioxide (NO₂) khi có xúc tác tạo thành nitrogen oxide (NO) và sulfur trioxide (SO₃) theo phản ứng:

SO₂(g) + NO₂(g) ⇌ SO₃(g) + NO(g); ΔrH°₂₉₈ = -41,8 kJ (*)`
    );
    setOptions(
      exam,
      19,
      tfOptions(
        "Biết nhiệt tạo thành chuẩn của NO₂(g), NO(g), SO₃(g) lần lượt là 33,2 kJ/mol, 91,3 kJ/mol, -329 kJ/mol, khi đó nhiệt tạo thành chuẩn của SO₂(g) là 229,1 kJ/mol.",
        "Các chất SO₃ và NO sinh ra có thể hấp thụ bởi CaO.",
        "Ở 298 K, trong bình kín dung tích 1 lít, hệ phản ứng (*) đang ở trạng thái cân bằng. Tất cả các chất đều ở trạng thái khí và có nồng độ lần lượt: [SO₃] = 3,0 M; [NO] = 2,0 M; [SO₂] = 4,0 M; [NO₂] = 0,5 M. Nếu thêm 1,50 mol NO₂ vào bình (giữ nguyên nhiệt độ và thể tích) thì nồng độ NO ở trạng thái cân bằng mới là 2,84 M. (Kết quả làm tròn đến hàng phần trăm.)",
        "Phản ứng (*) là phản ứng tỏa nhiệt."
      )
    );

    setPrompt(
      exam,
      20,
      `Trong phòng thí nghiệm, benzoic acid được điều chế từ toluene theo sơ đồ gồm hai giai đoạn được đánh số (1) và (2) như hình.

Trong một thí nghiệm tổng hợp benzoic acid theo sơ đồ trên, từ 4,0 mL toluene (khối lượng riêng 0,867 g/mL) thu được 2,0 gam benzoic acid (biết KMnO₄ và HCl được lấy dư). Hiệu suất của quá trình tổng hợp benzoic acid từ toluene là h%.

Số sóng hấp thụ đặc trưng của một số liên kết trên phổ hồng ngoại:
Liên kết | O-H (alcohol) | O-H (carboxylic acid) | C=O (ester, carboxylic acid)
Số sóng (cm⁻¹) | 3650-3200 | 3300-2500 | 1780-1650`
    );
    setOptions(
      exam,
      20,
      tfOptions(
        "Trong phản ứng ở giai đoạn (2), anion C₆H₅COO⁻ là một base theo thuyết Bronsted-Lowry.",
        "Giá trị của h là 43,5. (Kết quả làm tròn đến hàng phần mười.)",
        "Trong phản ứng với KMnO₄(aq) ở giai đoạn (1), toluene đóng vai trò là chất oxi hóa.",
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
        "A là cation K⁺ và B là anion NO₃⁻."
      )
    );

    setPrompt(
      exam,
      22,
      `Tại 25°C, một pin điện hóa được thiết lập bởi một điện cực Ni nhúng trong dung dịch Ni(NO₃)₂ 1,0 M và một điện cực Cu nhúng trong dung dịch Cu(NO₃)₂ 0,4 M (mô tả như hình vẽ). Khi pin bắt đầu hoạt động, dưới tác dụng của điện trường trong dung dịch điện li, các ion A và B di chuyển ngược chiều nhau về các điện cực.

Thế điện cực chuẩn:
E°(Cu²⁺/Cu) = +0,34 V
E°(Ni²⁺/Ni) = -0,257 V

Biết rằng thế điện cực của một cặp oxi hóa-khử ở nồng độ bất kì được tính theo phương trình Nernst như hình.`
    );

    setPrompt(
      exam,
      25,
      `Cho các cân bằng sau:

(1) H₂(g) + I₂(g) ⇌ 2HI(g)
(2) 2NO(g) + O₂(g) ⇌ 2NO₂(g)
(3) CaCO₃(s) ⇌ CaO(s) + CO₂(g)
(4) Fe(s) + 4H₂O(g) ⇌ Fe₃O₄(s) + 4H₂(g)
(5) CO(g) + Cl₂(g) ⇌ COCl₂(g)

Khi tăng áp suất, có bao nhiêu cân bằng chuyển dịch theo chiều thuận?`
    );

    setPrompt(
      exam,
      26,
      `Cho các thí nghiệm sau:

(1) Glucose phản ứng với thuốc thử Tollens.
(2) Glucose phản ứng với nước bromine.
(3) Glucose phản ứng với copper(II) hydroxide trong môi trường kiềm, đun nóng.
(4) Saccharose phản ứng với copper(II) hydroxide trong môi trường kiềm ở điều kiện thường.
(5) Cellulose phản ứng với dung dịch HNO₃ đặc có mặt H₂SO₄ đặc, đun nóng.

Có bao nhiêu thí nghiệm xảy ra phản ứng oxi hóa-khử?`
    );

    setPrompt(
      exam,
      28,
      `Xà phòng, chất giặt rửa được sử dụng rộng rãi trong đời sống: rửa tay, giặt quần áo, rửa chén bát, lau sàn,... Sơ đồ dưới đây mô tả cơ chế giặt rửa của xà phòng và các chất giặt rửa.

Cho các nhận định sau:
(1) Các chất CH₃[CH₂]₁₀CH₂-C₆H₄-SO₃Na và CH₃[CH₂]₁₀CH₂OSO₃Na đều là chất giặt rửa tổng hợp.
(2) Cấu tạo chung của xà phòng và chất giặt rửa gồm một phần ưa nước nối với một phần kị nước; trong đó phần ưa nước là các gốc hydrocarbon mạch dài tan nhiều trong nước.
(3) Khi tan trong nước, phần kị nước của phân tử xà phòng thâm nhập vào vết bẩn dầu mỡ; phần ưa nước hướng ra ngoài tiếp xúc với nước, làm cho vết bẩn bị chia nhỏ, phân tán vào nước và bị rửa trôi.
(4) Chất giặt rửa tổng hợp bị giảm hoặc mất tác dụng giặt rửa khi dùng với nước cứng vì tạo kết tủa với cation Ca²⁺, Mg²⁺.
(5) Các chất giặt rửa có tính hoạt động bề mặt cao, làm giảm sức căng bề mặt của nước, giúp vải sợi dễ thấm ướt và tăng hiệu quả giặt rửa.

Liệt kê các nhận định đúng theo số thứ tự tăng dần.`
    );
  }

  const answerKey = keys[exam.slugSuffix] ?? {};
  for (const question of exam.questions) {
    question.prompt = cleanChemistryText(question.prompt);
    question.options = question.options.map((option) => ({
      ...option,
      text: cleanChemistryText(option.text)
    }));
    question.correct_answer = normalizeAnswer(answerKey[question.question_number]);
    question.needs_review = false;
    question.explanation = explanation;
  }
}

moveSharedAssets(assets["hoang-dieu-sao-nam"], "16", ["17", "18"]);

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
