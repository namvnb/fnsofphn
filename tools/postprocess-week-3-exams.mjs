import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const examPath = path.join(root, "features/giup-cy/week-3-exams.json");
const assetPath = path.join(root, "features/giup-cy/week-3-assets.json");

const exams = JSON.parse(fs.readFileSync(examPath, "utf8"));
const assets = JSON.parse(fs.readFileSync(assetPath, "utf8"));

function question(exam, number) {
  return exam.questions.find((item) => item.question_number === number);
}

function setAnswer(exam, number, correctAnswer, points) {
  const item = question(exam, number);
  if (!item) return;
  item.correct_answer = correctAnswer;
  item.points = points;
  item.needs_review = false;
}

function capFirst(text) {
  const value = String(text ?? "").trim();
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("vi-VN") + value.slice(1);
}

function moveAsset(assetGroup, fromQuestion, toQuestion, rid) {
  const fromKey = String(fromQuestion);
  const toKey = String(toQuestion);
  const fromItems = assetGroup.questionAssets[fromKey] ?? [];
  const moving = fromItems.filter((item) => item.url.includes(rid));
  if (!moving.length) return;
  assetGroup.questionAssets[fromKey] = fromItems.filter((item) => !item.url.includes(rid));
  assetGroup.questionAssets[toKey] = [
    ...(assetGroup.questionAssets[toKey] ?? []).filter((item) => !item.url.includes(rid)),
    ...moving,
  ];
  if (assetGroup.questionAssets[fromKey].length === 0) delete assetGroup.questionAssets[fromKey];
}

function applyTrueFalsePresentation(exam) {
  for (const item of exam.questions) {
    if (item.question_type !== "true_false") continue;
    item.options = item.options.map((option) => ({
      ...option,
      text: capFirst(option.text),
    }));
  }
}

function applyAnswerKey(exam, answerMap) {
  for (const [number, correctAnswer] of Object.entries(answerMap)) {
    const q = question(exam, Number(number));
    if (!q) continue;
    const points = q.question_type === "true_false" ? 1 : 0.25;
    setAnswer(exam, Number(number), correctAnswer, points);
  }
}

const haTinh = exams.find((exam) => exam.slugSuffix.includes("hau-loc"));
const langSon = exams.find((exam) => exam.slugSuffix.includes("lang-son"));

if (haTinh) {
  const q13 = question(haTinh, 13);
  if (q13) {
    q13.prompt = "Cho các phát biểu sau về sulfuric acid đặc (H2SO4 đặc), hãy chọn phát biểu sai";
    q13.options = [
      { key: "A", text: "Khi bị bỏng bởi H2SO4 đặc cần nhanh chóng rửa sạch vị trí dính acid nhiều lần với dung dịch sodium hydroxide (NaOH), sau đó băng bó tạm thời bằng băng sạch rồi đến ngay cơ sở y tế gần nhất." },
      { key: "B", text: "Khi pha loãng H2SO4 đặc cần rót từ từ acid đặc theo đũa thuỷ tinh vào nước, sau đó khuấy đều." },
      { key: "C", text: "Sulfuric acid đặc gây bỏng khi rơi vào da, do vậy cần tuân thủ các nguyên tắc trước khi thực hành thí nghiệm." },
      { key: "D", text: "Không pha loãng H2SO4 đặc bằng cách đổ trực tiếp nước vào acid đặc vì phản ứng tỏa nhiệt mạnh, làm nước sôi đột ngột kéo theo những giọt acid bắn ra ngoài gây nguy hiểm." },
    ];
  }

  const q17 = question(haTinh, 17);
  if (q17) {
    q17.prompt = [
      "Cho các pin điện hoá và sức điện động chuẩn tương ứng:",
      "Pin điện hóa | Cu - X | Y - Cu | Z - Cu",
      "Sức điện động chuẩn (V) | 0,46 | 1,1 | 1,47",
      "(X, Y, Z là ba kim loại.)",
      "Dãy các kim loại xếp theo chiều tăng dần tính khử từ trái sang phải là",
    ].join("\n");
  }

  const q20 = question(haTinh, 20);
  if (q20) {
    q20.prompt = q20.prompt
      .replace("Nồng độ cồn (mg/1L khí thở) Mức tiền phạt (VNĐ) Hình phạt bổ sung Trừ điểm GPLX ≤ 0,25 2 triệu - 3 triệu – Trừ 04 điểm 0,25 đến 0,4 6 triệu - 8 triệu – Trừ 10 điểm > 0,4 8 triệu - 10 triệu Tước quyền sử dụng GPLX từ 22-24 tháng –",
        [
          "Nồng độ cồn (mg/1L khí thở) | Mức tiền phạt (VNĐ) | Hình phạt bổ sung | Trừ điểm GPLX",
          "≤ 0,25 | 2 triệu - 3 triệu | - | Trừ 04 điểm",
          "0,25 đến 0,4 | 6 triệu - 8 triệu | - | Trừ 10 điểm",
          "> 0,4 | 8 triệu - 10 triệu | Tước quyền sử dụng GPLX từ 22-24 tháng | -",
        ].join("\n"));
  }

  const q24 = question(haTinh, 24);
  if (q24) {
    q24.prompt = [
      "Bia, rượu, giấm ăn đều có thể được sản xuất từ nguyên liệu ban đầu là tinh bột trong ngũ cốc theo sơ đồ phản ứng sau:",
      "(1)        (2)        (3)        (4)",
      "Tinh bột → maltose → glucose → ethanol → acetic acid.",
      "Phản ứng nào trong chuỗi phản ứng trên thuộc loại phản ứng thuỷ phân? (Liệt kê đáp án theo số thứ tự phản ứng tăng dần).",
    ].join("\n");
  }

  const q22 = question(haTinh, 22);
  if (q22) {
    q22.prompt = "Vật liệu polymer đã và đang được sử dụng rộng rãi trong rất nhiều lĩnh vực. Với những ưu điểm vượt trội về tính chất, độ bền,... vật liệu polymer được ứng dụng rộng rãi trong đời sống làm vật liệu cách điện và đặc biệt là vật liệu xây dựng mới như: sơn chống thấm, bê tông siêu nhẹ, gỗ công nghiệp,... Các polymer được điều chế bằng phản ứng trùng hợp hoặc trùng ngưng. Những phát biểu sau đây là đúng hay sai?";
    q22.options = [
      { key: "a", text: "Nylon-6,6 được sử dụng phổ biến trong ngành dệt may và được điều chế từ phản ứng trùng ngưng." },
      { key: "b", text: "Poly(vinyl acetate) (PVA) được dùng chế tạo sơn, keo dán. Monomer dùng để trùng hợp tạo PVA là CH2=CHCOOCH3." },
      { key: "c", text: "Sự khác biệt cơ bản giữa hai loại phản ứng điều chế polymer là: phản ứng trùng ngưng có tạo ra các phân tử nhỏ, còn trùng hợp thì không tạo ra phân tử nhỏ." },
      { key: "d", text: "Trùng hợp buta-1,3-diene thu được polymer có cấu trúc tương tự cao su tự nhiên." },
    ];
  }

  const q28 = question(haTinh, 28);
  if (q28) {
    q28.prompt = [
      "Một học sinh làm thí nghiệm: Điện phân dung dịch NaCl",
      "Bước 1: Lắp thiết bị thí nghiệm điện phân dung dịch NaCl với điện cực trơ như hình bên dưới.",
      "Bước 2: Rót khoảng 80 mL dung dịch NaCl bão hoà vào cốc rồi nhúng hai điện cực graphite vào dung dịch.",
      "Bước 3: Nối hai điện cực graphite với hai cực của nguồn điện và tiến hành điện phân trong khoảng 5 phút.",
      "Bước 4: Cho một mẫu cánh hoa màu hồng vào cốc chứa khoảng 5 mL dung dịch sau điện phân.",
      "Quan sát hiện tượng thí nghiệm, học sinh có nhận xét:",
      "(1) Tại điện cực anode có khí H2 thoát ra.",
      "(2) Tại điện cực cathode xảy ra quá trình oxi hoá nước.",
      "(3) Cánh hoa hồng bị mất màu.",
      "(4) Dùng nắp đậy trong quá trình điện phân để hạn chế sự thoát Cl2 ra ngoài môi trường gây độc hại cho người làm thí nghiệm và ô nhiễm môi trường.",
      "Sắp xếp các phát biểu đúng theo thứ tự tăng dần.",
    ].join("\n");
  }

  applyTrueFalsePresentation(haTinh);
  applyAnswerKey(haTinh, {
    1: "D", 2: "C", 3: "D", 4: "D", 5: "C", 6: "A", 7: "D", 8: "C", 9: "D", 10: "A", 11: "D", 12: "B", 13: "A", 14: "A", 15: "A", 16: "B", 17: "D", 18: "C",
    19: { a: true, b: true, c: false, d: false },
    20: { a: false, b: true, c: false, d: true },
    21: { a: true, b: true, c: true, d: false },
    22: { a: true, b: false, c: true, d: false },
    23: "9,5", 24: "12", 25: "3", 26: "9", 27: "25", 28: "34",
  });
}

if (langSon) {
  const q20 = question(langSon, 20);
  if (q20) {
    q20.prompt = [
      "Một học sinh làm thí nghiệm điện phân dung dịch NaCl.",
      "Bước 1. Lắp thiết bị thí nghiệm điện phân dung dịch NaCl với điện cực trơ như hình dưới đây:",
      "Bước 2. Rót khoảng 80 mL dung dịch NaCl bão hoà vào cốc rồi nhúng hai điện cực graphite vào dung dịch.",
      "Bước 3. Nối hai điện cực graphite với hai cực của nguồn điện và tiến hành điện phân trong khoảng 5 phút.",
      "Bước 4. Cho một mẫu cánh hoa màu hồng vào cốc chứa khoảng 5 mL dung dịch sau điện phân.",
    ].join("\n");
  }

  const q21 = question(langSon, 21);
  if (q21) {
    q21.options = q21.options.map((option) =>
      option.key === "d" ? { ...option, text: "Công thức phân tử của nicotine là C₁₀H₁₅N₂." } : option
    );
  }

  const q22 = question(langSon, 22);
  if (q22) {
    q22.options = q22.options.map((option) =>
      option.key === "c"
        ? { ...option, text: "Nồng độ SO₄²⁻(aq) trong dung dịch ZnSO₄ giảm dần và trong dung dịch CuSO₄ tăng dần." }
        : option
    );
  }

  const q25 = question(langSon, 25);
  if (q25) {
    q25.prompt = [
      "Cho biết:",
      "Cặp oxi hóa - khử | Cu²⁺/Cu | Ag⁺/Ag | Fe²⁺/Fe | Mg²⁺/Mg | 2H⁺/H₂",
      "Thế điện cực chuẩn E°, V | +0,340 | +0,799 | -0,44 | -2,356 | 0,000",
      "Trong các kim loại Cu, Ag, Fe và Mg, số kim loại khử được ion H⁺ trong dung dịch ở điều kiện chuẩn là bao nhiêu?",
    ].join("\n");
  }

  applyTrueFalsePresentation(langSon);
  applyAnswerKey(langSon, {
    1: "B", 2: "B", 3: "B", 4: "B", 5: "D", 6: "D", 7: "D", 8: "B", 9: "C", 10: "D", 11: "C", 12: "B", 13: "B", 14: "C", 15: "B", 16: "C", 17: "B", 18: "A",
    19: { a: false, b: true, c: true, d: true },
    20: { a: true, b: false, c: true, d: true },
    21: { a: false, b: true, c: false, d: false },
    22: { a: false, b: true, c: false, d: true },
    23: "3", 24: "2,1", 25: "2", 26: "34", 27: "43,2", 28: "5,1",
  });
}

const langSonAssets = assets["51-so-gd-t-lang-son-lan-1"];
if (langSonAssets) {
  moveAsset(langSonAssets, 19, 18, "rId10");
  moveAsset(langSonAssets, 22, 21, "rId15");
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
