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
      "Tinh bột --(1)→ maltose --(2)→ glucose --(3)→ ethanol --(4)→ acetic acid.",
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

  const q3 = question(haTinh, 3);
  if (q3) {
    q3.prompt = [
      "Cho phản ứng hoá học xảy ra ở điều kiện chuẩn sau:",
      "2NO2(g) (đỏ nâu) → N2O4(g) (không màu).",
      "Biết NO2 và N2O4 có ΔfH°298 tương ứng là 33,18 kJ/mol và 9,16 kJ/mol.",
      "Điều này chứng tỏ phản ứng",
    ].join("\n");
  }

  const q4 = question(haTinh, 4);
  if (q4) {
    q4.prompt = [
      "Cho các carbohydrate: glucose, fructose, saccharose, maltose, và các phát biểu:",
      "(1) Cả 4 chất ở điều kiện thường đều là chất rắn, có vị ngọt, dễ tan trong nước.",
      "(2) Có 2 cặp chất là đồng phân của nhau.",
      "(3) Có 3 chất có tính khử và phản ứng được với thuốc thử Tollens.",
      "(4) Có 3 chất phản ứng được với Cu(OH)2 trong môi trường kiềm, tạo thành dung dịch có màu xanh lam.",
      "Số phát biểu đúng là",
    ].join("\n");
  }

  const q6 = question(haTinh, 6);
  if (q6) {
    q6.prompt = [
      "Một trong các hướng của phản ứng cracking nhiệt với butane là:",
      "CH3-CH2-CH2-CH3 --t°→ CH2=CH2 + CH3-CH3. (*)",
      "Giai đoạn đầu tiên của phản ứng trên xảy ra như sau:",
      "CH3-CH2-CH2-CH3 → 2CH3-CH2•. (1)",
      "Nhận định nào sau đây không đúng?",
    ].join("\n");
  }

  const q7 = question(haTinh, 7);
  if (q7) {
    q7.prompt = [
      "Phản ứng điều chế ethene từ ethanol theo phương trình hóa học:",
      "C2H5OH --H2SO4 đặc, 170°C→ CH2=CH2 + H2O.",
      "Đây là phản ứng",
    ].join("\n");
  }

  const q10 = question(haTinh, 10);
  if (q10) {
    q10.prompt = "Thế điện cực chuẩn của cặp oxi hoá - khử Fe3+/Fe2+ và Cu2+/Cu lần lượt là +0,771 V và +0,340 V. Nhận định nào sau đây là đúng?";
  }

  const q14 = question(haTinh, 14);
  if (q14) {
    q14.prompt = "Ở điều kiện chuẩn, kim loại có giá trị thế điện cực chuẩn E°(Mⁿ⁺/M) như thế nào thì có thể tác dụng với các dung dịch acid (như HCl, H2SO4 loãng) giải phóng H2?";
  }

  const q15 = question(haTinh, 15);
  if (q15) {
    q15.prompt = [
      "Để đề phòng nguy cơ gây cháy, nổ cần kiểm soát chặt chẽ các nguồn lửa, chất cháy, chất oxi hoá. Cho các biện pháp sau:",
      "(a) Không bật lửa ở nơi cấm lửa, không đốt lửa trong rừng, không đốt rác bừa bãi; đổ nước vào khu vực lửa trại ngay khi kết thúc.",
      "(b) Tập trung khi nấu nướng để tránh thiết bị quá nóng gây cháy hoặc quên tắt thiết bị gây chập điện.",
      "(c) Không tàng trữ, chế tạo trái phép thuốc nổ, thuốc pháo.",
      "(d) Sắp xếp hàng hoá, vật dụng dễ cháy cách xa nguồn lửa, nguồn nhiệt.",
      "Các biện pháp nhằm loại trừ khả năng phát sinh ra nguồn lửa có khả năng gây hoả hoạn là",
    ].join("\n");
  }

  const q20b = question(haTinh, 20);
  if (q20b) {
    q20b.prompt = [
      "Hiện nay người ta dùng thiết bị breathalyzer để đo nồng độ cồn trong khí thở của người tham gia giao thông.",
      "Khi có nồng độ cồn trong khí thở sẽ xảy ra phản ứng:",
      "C2H5OH + K2Cr2O7 + H2SO4 --Ag+→ CH3COOH + Cr2(SO4)3 + K2SO4 + H2O. (*)",
      "Tùy thuộc vào lượng K2Cr2O7 phản ứng, trên màn hình thiết bị sẽ xuất hiện số chỉ nồng độ cồn tương ứng.",
      "Người đi xe máy có nồng độ cồn trong khí thở sẽ bị xử phạt theo khung sau đây (trích từ Nghị định 168/2024/NĐ-CP):",
      "Nồng độ cồn (mg/1L khí thở) | Mức tiền phạt (VNĐ) | Hình phạt bổ sung | Trừ điểm GPLX",
      "≤ 0,25 | 2 triệu - 3 triệu | - | Trừ 04 điểm",
      "0,25 đến 0,4 | 6 triệu - 8 triệu | - | Trừ 10 điểm",
      "> 0,4 | 8 triệu - 10 triệu | Tước quyền sử dụng GPLX từ 22 - 24 tháng | -",
    ].join("\n");
  }

  const q21 = question(haTinh, 21);
  if (q21) {
    q21.prompt = "Các phát biểu sau về ứng dụng của tinh bột và cellulose là đúng hay sai?";
    q21.options = q21.options.map((option) =>
      option.key === "d" && !/[.!?]$/.test(option.text)
        ? { ...option, text: `${option.text}.` }
        : option
    );
  }

  const q20Options = question(haTinh, 20);
  if (q20Options) {
    q20Options.options = q20Options.options.map((option) =>
      option.key === "b"
        ? { ...option, text: option.text.replace("rượu 40o", "rượu 40°") }
        : option
    );
  }

  const q23 = question(haTinh, 23);
  if (q23) {
    q23.prompt = [
      "Pin nhiên liệu sử dụng ethanol được đặc biệt quan tâm do có nguồn nhiên liệu sinh học dồi dào.",
      "Phản ứng xảy ra khi một pin ethanol oxygen phóng điện ở 25°C trong dung dịch chất điện li là potassium hydroxide như sau:",
      "C2H5OH(l) + 3O2(g) → 2CO2(g) + 3H2O(l).",
      "Một pin ethanol - oxygen được dùng để thắp sáng 7 bóng đèn LED, mỗi bóng có công suất là 3 W (3 J/s) liên tục trong t giờ, tiêu thụ hết 34,5 gam ethanol với hiệu suất quá trình oxi hoá ethanol là 70%.",
      "Cho biết nhiệt tạo thành chuẩn của các chất:",
      "Chất | C2H5OH(l) | O2(g) | CO2(g) | H2O(l)",
      "ΔfH°298 (kJ/mol) | -277,6 | 0 | -393,5 | -285,8",
      "Giá trị của t bằng bao nhiêu? (Làm tròn kết quả đến hàng phần mười).",
    ].join("\n");
  }

  const q26 = question(haTinh, 26);
  if (q26) {
    q26.prompt = [
      "Một oleum có công thức H2SO4.nSO3.",
      "Hoà tan 7,362 gam oleum vào nước thành 1,0 L dung dịch sulfuric acid.",
      "Sau đó, rút 10,0 mL dung dịch acid cho vào bình tam giác, thêm vài giọt dung dịch phenolphthalein.",
      "Nhỏ từ từ dung dịch NaOH 0,10 M chứa trên burette vào bình tam giác đến khi dung dịch xuất hiện màu hồng nhạt, đọc thể tích NaOH đã dùng trên burette.",
      "Lặp lại thí nghiệm nhiều lần tính được giá trị thể tích NaOH trung bình là 18,0 mL.",
      "Giá trị của n là bao nhiêu?",
    ].join("\n");
  }

  const q27 = question(haTinh, 27);
  if (q27) {
    q27.prompt = [
      "Peptide có nhiều vai trò quan trọng, đặc biệt trong chăm sóc da và tóc, như chống lão hóa, tăng cường sản xuất collagen và elastin, giảm nếp nhăn, sửa chữa các tổn thương...",
      "Một peptide A có công thức như hình dưới đây.",
      "Cho các phát biểu về peptide A:",
      "(1) Peptide A có công thức phân tử là C7H14O5N2.",
      "(2) Peptide A không có phản ứng màu biuret.",
      "(3) Phân tử khối của peptide A là 236.",
      "(4) Peptide A được cấu tạo bởi ba loại α-amino acid khác nhau.",
      "(5) Khi thủy phân hoàn toàn 8,72 gam peptide A với dung dịch hydrochloric acid, thu được 12,36 gam hỗn hợp các muối Z, T.",
      "Sắp xếp các phát biểu đúng theo chiều tăng dần.",
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
  const q1 = question(langSon, 1);
  if (q1) {
    q1.prompt = [
      "Một gói làm nóng thức ăn (FRH) được sử dụng trong quân đội chứa 8 gam hỗn hợp (Mg 90%, Fe 4%, NaCl 6% về khối lượng), khi tiếp xúc với nước sẽ xảy ra phản ứng:",
      "Mg(s) + 2H2O(l) → Mg(OH)2(s) + 2H2(g)",
      "Cho biết: Phản ứng này tỏa ra nhiều nhiệt và làm nóng phần thức ăn đi kèm.",
      "Enthalpy tạo thành chuẩn (kJ/mol) của Mg(OH)2(s) và H2O(l) lần lượt là -928,4 và -285,8.",
      "Nhiệt dung riêng của nước, C = 4,2 J/(g.K); khối lượng riêng của nước là D = 1 g/mL.",
      "Phần nước được làm nóng chỉ nhận được tối đa 60% lượng nhiệt tỏa ra.",
      "Lượng nhiệt mà nước nhận được để thay đổi Δt (°C) được tính theo công thức: Q = m.C.Δt.",
      "Nếu sử dụng gói FRH trên để làm nóng nước từ 25°C lên 100°C thì lượng nước tối đa theo mL được làm nóng là",
    ].join("\n");
  }

  const q8 = question(langSon, 8);
  if (q8) {
    q8.prompt = [
      "Trong bình phản ứng (có dung tích không đổi), ban đầu chứa N2O4 và NO2 với nồng độ mol/L bằng nhau.",
      "Xảy ra phản ứng thuận nghịch:",
      "N2O4(g) ⇌ 2NO2(g).",
      "Tại thời điểm cân bằng, nồng độ N2O4 giảm đi một nửa so với ban đầu.",
      "Phần trăm số mol NO2 trong hỗn hợp ở trạng thái cân bằng là",
    ].join("\n");
  }

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

  const q19 = question(langSon, 19);
  if (q19) {
    q19.prompt = [
      "Methyl salicylate là hoạt chất có trong nhiều loại cây, được dùng làm thuốc giảm đau và chống viêm, có công thức như hình dưới đây.",
      "Methyl salicylate được điều chế bằng phương pháp cho salicylic acid phản ứng với methanol, xúc tác H2SO4 đặc theo phản ứng sau:",
      "HO-C6H4-COOH + CH3OH ⇌ HO-C6H4-COOCH3 + H2O (1).",
      "Sau khi phản ứng kết thúc, sản phẩm được tinh chế và làm khan trước khi sử dụng hoặc phân tích.",
      "Cho 13,8 gam salicylic acid phản ứng với 20 mL methanol (D = 0,79 g/mL), sau phản ứng",
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

const haTinhAssets = assets["41-thpt-hau-loc-1-lan-1-ha-tinh"];
if (haTinhAssets) {
  delete haTinhAssets.questionAssets["8"];
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
