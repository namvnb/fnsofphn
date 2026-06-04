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

function moveAsset(assetEntry, fromQuestion, toQuestion) {
  if (!assetEntry?.questionAssets?.[fromQuestion]) return;
  assetEntry.questionAssets[toQuestion] = assetEntry.questionAssets[fromQuestion];
  delete assetEntry.questionAssets[fromQuestion];
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
      19,
      `Poly(ethylene terephthalate) (PET) là một polymer nhiệt dẻo phổ biến với nhiều ứng dụng nhờ vào tính chất trong suốt, nhẹ và độ bền cao. PET được tổng hợp theo phương trình hóa học sau:

nHOCH₂CH₂OH + n(p-HOOC-C₆H₄-COOH) (xt, t°) → [-CH₂CH₂-OOC-C₆H₄-COO-]ₙ + 2nH₂O`
    );

    setPrompt(
      exam,
      20,
      `Quặng vàng tồn tại trong tự nhiên thường có hàm lượng vàng thấp. Phương pháp tách vàng phù hợp hiện nay là phương pháp Cyanide. Theo phương pháp này, để thu hồi vàng từ quặng, người ta thường nghiền nhỏ quặng rồi hòa tan trong dung dịch KCN (potassium cyanide, rất độc) cùng với dòng không khí liên tục được thổi vào. Khi đó, vàng bị hòa tan tạo thành phức chất (các chất khác trong quặng không phản ứng với KCN):

4Au(s) + 8KCN(aq) + O₂(g) + 2H₂O(l) → 4K[Au(CN)₂](aq) + 4KOH(aq) (1)

Tiếp theo, cho bột kẽm đến dư vào dung dịch phức, thu được bột vàng (có lẫn một ít bột kẽm):

Zn(s) + 2K[Au(CN)₂](aq) → K₂[Zn(CN)₄](aq) + 2Au(s) (2)`
    );

    setPrompt(
      exam,
      21,
      `Kết quả phân tích thành phần của một muối chloride ngậm nước (X) của kim loại M thu được kết quả sau:

| Nguyên tố | M | O | Cl | H |
| Thành phần khối lượng, % | 24,79 | 40,35 | 29,83 | 5,04 |

Trong dung dịch muối X tồn tại cân bằng:

[M(H₂O)₆]²⁺(aq, màu hồng) + 4Cl⁻(aq) ⇌ [MCl₄]²⁻(aq, màu xanh) + 6H₂O; ΔH > 0

Cho vào hai ống nghiệm, mỗi ống khoảng 2 mL dung dịch muối X nồng độ 0,5M. Thêm tiếp vài giọt dung dịch HCl đặc vào ống nghiệm thứ nhất.`
    );

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
      4,
      `Glucosamine hydrochloride được sản xuất từ chitin (C₈H₁₃NO₅)ₙ có trong vỏ tôm. Glucosamine hydrochloride C₆H₁₃NO₅.HCl là sản phẩm hỗ trợ giảm các triệu chứng viêm, đau thoái hóa khớp, mạnh gân cốt, tăng tiết chất nhờn khớp, giúp bảo vệ sụn khớp.

Glucosamine hydrochloride được chuyển hóa từ chitin có trong vỏ tôm theo sơ đồ sau:

Vỏ tôm bóc từ các nhà máy chế biến thủy, hải sản được tận dụng để sản xuất 1000 hộp thực phẩm chức năng chứa glucosamine hydrochloride. Mỗi hộp này có 10 vỉ thuốc, mỗi vỉ chứa 12 viên nang, với hàm lượng glucosamine hydrochloride là 1500 mg/viên.

Để sản xuất 1000 hộp thực phẩm chức năng trên thì cần sử dụng bao nhiêu kg vỏ tôm? Biết vỏ tôm chứa 28% chitin, hiệu suất điều chế glucosamine hydrochloride từ chitin đạt 40%.`
    );

    setPrompt(
      exam,
      7,
      `Theo tiêu chuẩn Việt Nam (TCVN 7209 : 2002), hàm lượng chì (lead) cho phép đối với đất sử dụng cho mục đích nông nghiệp là 70 ppm (biết 1 ppm = 1 mg/kg). Người ta tiến hành phân tích 3 mẫu đất (1), (2) và (3) bằng phương pháp quang phổ và thu được kết quả như sau:

| Mẫu | (1) | (2) | (3) |
| Khối lượng mẫu | 2 gam | 0,5 gam | 1 gam |
| Khối lượng chì | 4.10⁻⁵ gam | 3,8.10⁻⁵ gam | 8,1.10⁻⁵ gam |

Kết luận nào sau đây là đúng?`
    );

    setPrompt(
      exam,
      9,
      `Nước cứng gây nhiều trở ngại cho đời sống thường ngày. Các nguồn nước ngầm hoặc nước ở các ao hồ, sông suối thường có độ cứng cao bởi quá trình hòa tan các ion Ca²⁺, Mg²⁺ có trong thành phần của lớp trầm tích đá vôi. Dựa vào chỉ số tổng nồng độ của các ion Ca²⁺ và Mg²⁺ để phân chia độ cứng thành các cấp độ khác nhau như hình sau.

Cho các phát biểu sau:
(1) Có thể dùng Na₂CO₃ để làm mềm nước có tính cứng toàn phần.
(2) Nước có tổng nồng độ ion Ca²⁺, Mg²⁺ bằng 150 mg/L thuộc loại nước cứng vừa.
(3) Nước cứng làm cho xà phòng có ít bọt, giảm khả năng tẩy rửa của xà phòng.
(4) Nước tự nhiên có chứa ion Ca²⁺, Mg²⁺, HCO₃⁻ gọi là nước có tính cứng vĩnh cửu.
(5) Để loại bỏ lớp cặn trong ấm đun nước lâu ngày có thể dùng dung dịch giấm ăn.

Số phát biểu đúng là`
    );

    setPrompt(
      exam,
      10,
      `Bệnh bướu cổ là tình trạng lớn lên bất thường của tuyến giáp liên quan tới hormone thyroglobulin. Thyroglobulin là protein cao phân tử (M = 660.000 g/mol), trong thành phần có chứa thyroxine với 4 nguyên tử iodine. Thyroxine có công thức cấu tạo dạng khung phân tử như hình sau.

Cho các phát biểu sau về thyroxine:
(1) Bổ sung muối iodine là bổ sung muối ăn trộn I₂.
(2) Số nguyên tử carbon của thyroxine là 15.
(3) Thyroxine là hợp chất hữu cơ tạp chức.
(4) Độ bất bão hòa của thyroxine là 7.
(5) Ở điều kiện thường, thyroxine có thể tác dụng với NaOH và HCl.

Số phát biểu đúng là`
    );

    setPrompt(
      exam,
      14,
      `Quá trình reforming là quá trình sắp xếp lại mạch hydrocarbon để tạo ra nhiều hydrocarbon mạch nhánh, làm tăng chỉ số octane của xăng hoặc tạo ra arene khác. Cho các quá trình sau:

(1) Hexane → isohexane (t°, xt).
(2) Ethylbenzene → 1,2-dimethylbenzene (t°, xt).
(3) Octane → butane + but-1-ene (t°, xt).
(4) Octane → 2,2,4-trimethylpentane (t°, xt).

Có bao nhiêu quá trình là quá trình reforming?`
    );

    setPrompt(
      exam,
      19,
      `Methyl salicylate là thành phần chính của các loại thuốc xoa bóp, dầu gió giúp giảm đau cơ và khớp. Hợp chất này được tổng hợp bằng cách đun hồi lưu hỗn hợp gồm salicylic acid và methyl alcohol với xúc tác H₂SO₄ đậm đặc theo phương trình hóa học trong hình dưới đây.

Sau khi kết thúc thí nghiệm, tiến hành tách và tinh chế sản phẩm. Phương pháp phổ hồng ngoại (IR) được sử dụng để kiểm tra cấu tạo của các hợp chất hữu cơ có trong hỗn hợp sau phản ứng. Bảng số liệu về số sóng hấp thụ đặc trưng (cm⁻¹) của một số liên kết trên phổ IR được như sau:

| Liên kết | O-H (alcohol, phenol) | O-H (carboxylic acid) | C=O (ester, carboxylic acid) |
| Số sóng (cm⁻¹) | 3650-3200 | 3300-2500 | 1780-1650 |`
    );

    setPrompt(
      exam,
      20,
      `Để chuẩn bị cho buổi thực hành vào sáng hôm sau, một giáo viên đã pha dung dịch KMnO₄ có nồng độ 0,05M dùng làm chất chuẩn. Tuy nhiên, do thời tiết nắng nóng, dung dịch có dấu hiệu bị phân hủy. Vì vậy, trước khi bắt đầu giờ thực hành, giáo viên đã tiến hành xác định lại nồng độ chính xác của dung dịch này theo các bước sau:

Bước 1: Hòa tan 1,512 gam tinh thể H₂C₂O₄.2H₂O bằng nước cất, sau đó chuyển vào bình định mức 100 mL và thêm nước đến vạch, thu được dung dịch X.

Bước 2: Lấy chính xác 10,00 mL dung dịch X cho vào bình tam giác rồi thêm tiếp 5 mL dung dịch H₂SO₄ 2M. Sau đó, đun nóng nhẹ dung dịch trong bình tam giác đến khoảng 70°C.

Bước 3: Chuẩn độ dung dịch trong bình tam giác bằng dung dịch KMnO₄ ở trên đến khi xuất hiện màu hồng nhạt (bền trong khoảng 20 giây) thì dừng lại. Thể tích trung bình của dung dịch KMnO₄ sau 3 lần chuẩn độ là 9,70 mL.

Phương pháp chuẩn độ tuân theo phương trình hóa học (chưa cân bằng) sau:
H₂C₂O₄ + KMnO₄ + H₂SO₄ → K₂SO₄ + MnSO₄ + CO₂ + H₂O`
    );

    setPrompt(
      exam,
      22,
      `Để đảm bảo an toàn cho người bơi và tối ưu hiệu quả của các hóa chất khử trùng (như chlorine), pH của nước bể bơi cần được duy trì ổn định trong khoảng 7,2-7,6. Để đo pH dung dịch, một nhân viên kĩ thuật đã sử dụng máy đo pH cầm tay (như ảnh dưới đây), thiết bị hoạt động dựa trên nguyên lí pin điện hóa.

Quy trình xác định pH nước của bể bơi của nhân viên kĩ thuật được tóm tắt như sau:

Bước 1: Nhúng điện cực vào các dung dịch chuẩn ở 25°C để tiến hành hiệu chuẩn máy và thu được kết quả như sau:

| pH dung dịch chuẩn | 4,01 | 7,01 | 10,01 |
| Sức điện động (mV) | +182,4 | +5,3 | -171,8 |

Bước 2: Nhúng điện cực vào mẫu nước lấy từ bể bơi, máy hiển thị giá trị pH là 7,50.

Lưu ý: Mỗi lần hiệu chuẩn hoặc đo đều phải rửa điện cực bằng nước cất sạch.`
    );

    setPrompt(
      exam,
      23,
      `Cho dãy các chất sau:
(1) but-2-yne
(2) propanal
(3) benzaldehyde
(4) acetone
(5) propene
(6) acetylene

Hãy liệt kê theo thứ tự tăng dần các chất tạo được kết tủa khi tác dụng với dung dịch thuốc thử Tollens (ví dụ: 14, 125,...).`
    );

    setPrompt(
      exam,
      26,
      `Xăng sinh học E5 chứa 5% ethanol về thể tích, còn lại là xăng (giả thiết chỉ là octane). Khi được đốt cháy hoàn toàn:
- 1 mol ethanol tỏa ra lượng nhiệt là 1365,0 kJ.
- 1 mol octane tỏa ra lượng nhiệt là 5928,7 kJ.

Trung bình, một chiếc xe máy di chuyển được 1 km thì cần một nhiệt lượng chuyển thành công cơ học có độ lớn là 212 kJ. Nếu xe máy đó đã sử dụng 4,6 lít xăng E5 ở trên thì quãng đường di chuyển được là bao nhiêu km?

Biết hiệu suất sử dụng nhiên liệu của động cơ là 25%, khối lượng riêng của ethanol là 0,8 g/mL, của octane là 0,7 g/mL. Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng đơn vị.`
    );

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

  if (exam.slugSuffix.includes("60-chuyen-khtn")) {
    setPrompt(
      exam,
      2,
      `Trong phức chất, số liên kết σ (sigma) tạo thành giữa một phối tử với nguyên tử trung tâm được gọi là dung lượng phối trí của phối tử đó. Cấu tạo của phức chất [Fe(C₂O₄)₃]³⁻ được cho ở hình dưới đây.

Dung lượng phối trí của mỗi phối tử C₂O₄²⁻ trong phức chất đã cho là`
    );

    setPrompt(
      exam,
      13,
      `Phương trình hóa học của phản ứng thủy phân ethyl bromide là:
CH₃CH₂Br + NaOH → CH₃CH₂OH + NaBr (1)

Một giai đoạn tạo thành sản phẩm trong cơ chế của phản ứng trên xảy ra như hình dưới đây.

Nhận định nào sau đây là đúng?`
    );

    setPrompt(
      exam,
      17,
      `Dưới đây là sơ đồ của một pin điện hóa và chiều di chuyển của dòng electron.

Cặp nguyên tố X và Y nào dưới đây phù hợp với sơ đồ này?`
    );

    setPrompt(
      exam,
      22,
      "Aniline là hóa chất được sử dụng nhiều trong lĩnh vực phẩm nhuộm, dược phẩm. Trong phòng thí nghiệm, quá trình điều chế aniline từ nitrobenzene được thực hiện theo sơ đồ phản ứng trong hình dưới đây."
    );

    const q22 = exam.questions.find((item) => item.question_number === 22);
    if (q22) {
      q22.options = tfOptions(
        "Trong phản ứng khử nitrobenzene bằng (Zn + HCl), tác nhân khử là hydrogen mới sinh [H].",
        "Trong phản ứng ở giai đoạn (2), cation C6H5NH3+ là một base theo thuyết Bronsted-Lowry.",
        "Theo sơ đồ tổng hợp aniline ở trên, từ 61,5 gam nitrobenzene có thể thu được 37,2 gam aniline, với hiệu suất của quá trình tổng hợp aniline từ nitrobenzene là 80%.",
        "Phương pháp có thể sử dụng để tách aniline ra khỏi hỗn hợp sau kiềm hóa là phương pháp chiết lỏng-lỏng; aniline dễ dàng được chiết tách ra khỏi pha nước bằng các dung môi hữu cơ như ether, benzene hoặc dichloromethane."
      );
    }

    setPrompt(
      exam,
      24,
      `Hợp chất hữu cơ (X) có công thức cấu tạo dưới đây.

Khi thủy phân không hoàn toàn (X) sẽ thu được tối đa bao nhiêu tripeptide?`
    );
  }

  if (exam.slugSuffix.includes("70-chuyen-tran-phu")) {
    setPrompt(
      exam,
      8,
      `Lidocaine (công thức phân tử C₁₄H₂₂N₂O) là một hợp chất hữu cơ được sử dụng phổ biến làm thuốc gây tê tại chỗ trong y học, đặc biệt trong nha khoa và tiểu phẫu. Lidocaine có công thức cấu tạo dạng khung phân tử như hình dưới đây.

Khi cho Lidocaine tác dụng với NaOH dư, có thể xảy ra phản ứng thủy phân liên kết amide trong môi trường base thu được chất X và amine Y. X có công thức cấu tạo là`
    );

    setPrompt(
      exam,
      21,
      `Hyaluronic acid (HA) là một polysaccharide quan trọng trong cơ thể người, tập trung nhiều ở dịch khớp, thủy tinh thể và da. HA đóng vai trò là chất bôi trơn và khả năng dưỡng ẩm sâu. Hình ảnh dưới đây mô tả cấu tạo một đoạn mạch của HA, gồm các đơn vị lặp lại là disaccharide của D-glucuronic acid và N-acetyl-D-glucosamine liên kết xen kẽ với nhau.

Biết một mắt xích disaccharide của HA có công thức phân tử C₁₄H₂₁NO₁₁.`
    );

    setPrompt(
      exam,
      22,
      `Để đảm bảo an toàn cho người bơi và tối ưu hiệu quả của các hóa chất khử trùng (như chlorine), pH của nước bể bơi cần được duy trì ổn định trong khoảng 7,2-7,6. Để đo pH dung dịch, một nhân viên kĩ thuật đã sử dụng máy đo pH cầm tay (như ảnh dưới đây), thiết bị hoạt động dựa trên nguyên lí pin điện hóa.

Quy trình xác định pH nước của bể bơi của nhân viên kĩ thuật được tóm tắt như sau:

Bước 1: Nhúng điện cực vào các dung dịch chuẩn ở 25°C để tiến hành hiệu chuẩn máy và thu được kết quả như sau:

| pH dung dịch chuẩn | 4,01 | 7,01 | 10,01 |
| Sức điện động (mV) | +182,4 | +5,3 | -171,8 |

Bước 2: Nhúng điện cực vào mẫu nước lấy từ bể bơi, máy hiển thị giá trị pH là 7,50.

Lưu ý: Mỗi lần hiệu chuẩn hoặc đo đều phải rửa điện cực bằng nước cất sạch.`
    );

    const q22 = exam.questions.find((item) => item.question_number === 22);
    if (q22) {
      q22.options = tfOptions(
        "Nồng độ ion H+ của nước bể bơi đo được ở bước 2 gấp 2,51 lần nồng độ ion H+ của dung dịch chuẩn có pH = 10,01.",
        "Nước trong bể bơi tại thời điểm đo đang ở trạng thái không an toàn.",
        "Biết rằng, giá trị sức điện động phụ thuộc tuyến tính vào pH dung dịch theo dạng phương trình y = ax + b. Ở bước 2, sức điện động mà máy đo ghi nhận được có giá trị xấp xỉ -23,6 mV.",
        "Ở bước 1, sức điện động của hệ có xu hướng giảm khi nồng độ H+ trong dung dịch giảm."
      );
    }

    setPrompt(
      exam,
      27,
      `Thuốc aspirin thuộc nhóm thuốc kháng viêm non-steroid có tác dụng giảm đau, hạ sốt. Thuốc aspirin được tổng hợp từ các nguyên liệu theo phương trình hóa học trong hình dưới đây (hiệu suất phản ứng tính theo salicylic acid là 60%).

Để sản xuất một lô thuốc aspirin gồm 10 triệu viên nén, mỗi viên nén chứa 81 mg aspirin, thì khối lượng salicylic acid cần dùng là bao nhiêu kg?`
    );
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

const khtnAssets = assets["60-chuyen-khtn-ha-noi-lan-2-thi-thu-tot-nghiep-thpt-removed-watermarked"];
if (khtnAssets) {
  const anilineScheme = khtnAssets.questionAssets["21"];
  const peptideStructure = khtnAssets.questionAssets["22"];
  if (anilineScheme) khtnAssets.questionAssets["22"] = anilineScheme;
  if (peptideStructure) khtnAssets.questionAssets["24"] = peptideStructure;
  delete khtnAssets.questionAssets["21"];
}

const tranPhuAssets = assets["70-chuyen-tran-phu-lan-2-hai-phong-thi-thu-tot-nghiep-1-removed-watermarked"];
if (tranPhuAssets) {
  delete tranPhuAssets.questionAssets["14"];
  moveAsset(tranPhuAssets, "25", "27");
  if (tranPhuAssets.questionAssets["21"]?.length > 1) {
    tranPhuAssets.questionAssets["22"] = [tranPhuAssets.questionAssets["21"][1]];
    tranPhuAssets.questionAssets["21"] = [tranPhuAssets.questionAssets["21"][0]];
  }
}

fs.writeFileSync(examPath, JSON.stringify(exams, null, 2) + "\n", "utf8");
fs.writeFileSync(assetPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
