import type { Json } from "@/types/database";
import week2ExamData from "./week-2-exams.json";
import week3ExamData from "./week-3-exams.json";
import week4ExamData from "./week-4-exams.json";

export type SampleQuestion = {
  section: string;
  question_number: number;
  question_type: "single_choice" | "true_false" | "short_answer";
  prompt: string;
  options: Json;
  correct_answer: Json;
  points: number;
  explanation?: string;
  needs_review?: boolean;
  sort_order: number;
};

export type SampleExam = {
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  slugSuffix: string;
  source_file_name: string;
  is_active: boolean;
  questions: SampleQuestion[];
};

const choice = (a: string, b: string, c: string, d: string) => [
  { key: "A", text: a },
  { key: "B", text: b },
  { key: "C", text: c },
  { key: "D", text: d }
];

const tfOptions = (a: string, b: string, c: string, d: string) => [
  { key: "a", text: a },
  { key: "b", text: b },
  { key: "c", text: c },
  { key: "d", text: d }
];

const camPhaQuestions: SampleQuestion[] = [
  {
    section: "Phần I",
    question_number: 1,
    question_type: "single_choice",
    prompt:
      "Insulin là hoocmon của cơ thể có tác dụng điều tiết lượng đường trong máu. Thủy phân một phần insulin thu được heptapeptide (X). Khi thủy phân không hoàn toàn X thu được hỗn hợp các peptide trong đó có các peptide sau: Ser-His-Leu; Val-Glu-Ala; His-Leu-Val; Gly-Ser-His. Nếu đánh số amino acid đầu N trong X là số 1 thì amino acid Glu sẽ ở vị trí số",
    options: choice("3", "5", "4", "6"),
    correct_answer: "D",
    points: 0.25,
    explanation: "Từ các mảnh peptide suy ra X là Gly-Ser-His-Leu-Val-Glu-Ala.",
    sort_order: 1
  },
  {
    section: "Phần I",
    question_number: 2,
    question_type: "single_choice",
    prompt:
      "Trong y học, dung dịch glucose 5% (G-5) là dịch truyền tĩnh mạch cho những trường hợp bệnh nhân thiếu nước và năng lượng theo chỉ định của bác sĩ. Một chai chứa 500 gam dịch truyền G-5 cung cấp được tối đa m (kJ) năng lượng. Giá trị của m là (Biết 1 gam glucose có thể cung cấp 10 kJ năng lượng).",
    options: choice("400", "250", "300", "500"),
    correct_answer: "B",
    points: 0.25,
    explanation: "500 x 0,05 x 10 = 250 kJ.",
    sort_order: 2
  },
  {
    section: "Phần I",
    question_number: 3,
    question_type: "single_choice",
    prompt: "Polypropylene (PP) là chất dẻo thường được sử dụng để sản xuất các sản phẩm thiết bị y tế, đồ gia dụng... PP được tổng hợp từ monomer nào sau đây?",
    options: choice("CH3CH=CH2", "C6H5OH và HCHO", "CH2=CH2", "CH2=CHCN"),
    correct_answer: "A",
    points: 0.25,
    sort_order: 3
  },
  {
    section: "Phần I",
    question_number: 4,
    question_type: "single_choice",
    prompt: `Cho bảng giá trị thế điện cực chuẩn của các cặp oxi hóa - khử như sau:

Cặp oxi hóa khử | Fe2+/Fe | Cu2+/Cu | Zn2+/Zn | Ag+/Ag
Thế điện cực chuẩn (V) | -0,44 | +0,34 | -0,76 | +0,80

Pin Galvani thiết lập từ hai cặp oxi hóa - khử nào trong số các cặp trên có sức điện động chuẩn bằng 0,78V?`,
    options: choice("Zn-Fe", "Fe-Cu", "Zn-Ag", "Cu-Ag"),
    correct_answer: "B",
    points: 0.25,
    explanation: "0,34 - (-0,44) = 0,78 V.",
    sort_order: 4
  },
  {
    section: "Phần I",
    question_number: 5,
    question_type: "single_choice",
    prompt: `Cho các phản ứng thuận nghịch đang ở trạng thái cân bằng:
(1) H2(g) + I2(g) ⇄ 2HI(g).
(2) Fe2O3(s) + 3CO(g) ⇄ 2Fe(s) + 3CO2(g).
(3) 2NO2(g) ⇄ N2O4(g).

Yếu tố áp suất không ảnh hưởng đến chuyển dịch cân bằng của phản ứng thuận nghịch nào?`,
    options: choice("(1); (2)", "(2)", "(3)", "(1)"),
    correct_answer: "A",
    points: 0.25,
    sort_order: 5
  },
  {
    section: "Phần I",
    question_number: 6,
    question_type: "single_choice",
    prompt: "Chất nào sau đây thuộc loại disaccharide?",
    options: choice("Saccharose", "Fructose", "Tinh bột", "Cellulose"),
    correct_answer: "A",
    points: 0.25,
    sort_order: 6
  },
  {
    section: "Phần I",
    question_number: 7,
    question_type: "single_choice",
    prompt: `Có 4 dung dịch NH3, HCl, NH4Cl, Na2CO3 cùng nồng độ được đánh ngẫu nhiên là A, B, C, D. Giá trị pH và khả năng dẫn điện của dung dịch theo bảng sau:

Dung dịch | A | B | C | D
pH | 5,25 | 11,53 | 1,25 | 11,00
Khả năng dẫn điện | Tốt | Tốt | Tốt | Kém

Các dung dịch A, B, C, D lần lượt là`,
    options: choice("Na2CO3, HCl, NH3, NH4Cl", "NH4Cl, Na2CO3, HCl, NH3", "NH4Cl, NH3, HCl, Na2CO3", "NH3, NH4Cl, HCl, Na2CO3"),
    correct_answer: "B",
    points: 0.25,
    sort_order: 7
  },
  {
    section: "Phần I",
    question_number: 8,
    question_type: "single_choice",
    prompt: "Ngâm hoa quả làm siro thuộc loại tách biệt và tinh chế nào?",
    options: choice("Sắc kí cột", "Phương pháp chưng cất", "Phương pháp kết tinh", "Phương pháp chiết"),
    correct_answer: "D",
    points: 0.25,
    sort_order: 8
  },
  {
    section: "Phần I",
    question_number: 9,
    question_type: "single_choice",
    prompt: "Chất X được tạo thành trong cây xanh nhờ quá trình quang hợp. Thủy phân hoàn toàn X (xúc tác acid) thu được chất Y. Chất Y có nhiều trong quả nho chín nên còn được gọi là đường nho. Hai chất X và Y lần lượt là",
    options: choice("tinh bột và glucose", "tinh bột và saccharose", "cellulose và fructose", "cellulose và saccharose"),
    correct_answer: "A",
    points: 0.25,
    sort_order: 9
  },
  {
    section: "Phần I",
    question_number: 10,
    question_type: "single_choice",
    prompt: "Tên gọi theo danh pháp thay thế của chất có công thức cấu tạo CH3CH2NH2 là",
    options: choice("methylamine", "methanamine", "ethylamine", "ethanamine"),
    correct_answer: "D",
    points: 0.25,
    sort_order: 10
  },
  {
    section: "Phần I",
    question_number: 11,
    question_type: "single_choice",
    prompt: "Trong phòng thí nghiệm, dung dịch chất nào sau đây phù hợp để kiểm tra sự có mặt của ion SO4 2- (aq)?",
    options: choice("NaOH", "HNO3", "BaCl2", "AgNO3"),
    correct_answer: "C",
    points: 0.25,
    sort_order: 11
  },
  {
    section: "Phần I",
    question_number: 12,
    question_type: "single_choice",
    prompt: "Tên gọi của CH3COOCH3 là",
    options: choice("propyl acetate", "methyl acetate", "ethyl acetate", "methyl propionate"),
    correct_answer: "B",
    points: 0.25,
    sort_order: 12
  },
  {
    section: "Phần I",
    question_number: 13,
    question_type: "single_choice",
    prompt: "Nguyên tố nào sau đây mà nguyên tử có 7 electron ở lớp ngoài cùng?",
    options: choice("Na (Z = 11)", "Cl (Z = 17)", "Ar (Z = 18)", "Al (Z = 13)"),
    correct_answer: "B",
    points: 0.25,
    sort_order: 13
  },
  {
    section: "Phần I",
    question_number: 14,
    question_type: "single_choice",
    prompt: `Theo quy định, tất cả các loại chất lỏng, tinh dầu được coi là chất lỏng dễ cháy và là hàng hoá nguy hiểm nếu có điểm chớp cháy nhỏ hơn 60°C không được vận chuyển qua đường hàng không. Cho điểm chớp cháy của một số loại tinh dầu thường gặp như sau:

Tinh dầu | Trầm hương | Quế | Đinh hương | Tràm gió | Oải hương | Thông
Điểm chớp cháy (°C) | 51 | 87 | 87 | 52 | 68 | 65

Trong các tinh dầu trên, theo quy định có bao nhiêu tinh dầu hành khách được phép mang theo lên máy bay?`,
    options: choice("4", "6", "5", "2"),
    correct_answer: "A",
    points: 0.25,
    sort_order: 14
  },
  {
    section: "Phần I",
    question_number: 15,
    question_type: "single_choice",
    prompt: "Hợp chất nào dưới đây được sử dụng làm xà phòng?",
    options: choice("CH3[CH2]SO[CH2]5CH3", "CH3[CH2]12COOCH3", "CH3[CH2]14COONa", "CH3COONa"),
    correct_answer: "C",
    points: 0.25,
    sort_order: 15
  },
  {
    section: "Phần I",
    question_number: 16,
    question_type: "single_choice",
    prompt: "Loại polymer nào sau đây được điều chế bằng phản ứng trùng hợp?",
    options: choice("Tơ nylon-6,6", "Tơ acetate", "Tơ olon", "Tơ nylon-7"),
    correct_answer: "C",
    points: 0.25,
    sort_order: 16
  },
  {
    section: "Phần I",
    question_number: 17,
    question_type: "single_choice",
    prompt: "Tùy thuộc vào pH của dung dịch, alanine tồn tại một số dạng như hình. Khi pH = 3 thì alanine sẽ tồn tại dạng nào trong các dạng trên? Cho biết pI của alanine là 6,01.",
    options: choice("(3)", "(4)", "(1)", "(2)"),
    correct_answer: null,
    points: 0.25,
    needs_review: true,
    explanation: "Câu này phụ thuộc hình cấu tạo trong file Word, cần rà trực tiếp theo ảnh gốc trước khi chấm tự động.",
    sort_order: 17
  },
  {
    section: "Phần I",
    question_number: 18,
    question_type: "single_choice",
    prompt: "Hiện tượng mưa acid là do không khí bị ô nhiễm bởi các khí nào sau đây?",
    options: choice("CH4, HCl, CO", "SO2, NO, NO2", "NO, CO, CO2", "Cl2, CH4, SO2"),
    correct_answer: "B",
    points: 0.25,
    sort_order: 18
  },
  {
    section: "Phần II",
    question_number: 19,
    question_type: "true_false",
    prompt: `Một nhóm nghiên cứu về tốc độ phản ứng đã tiến hành hai thí nghiệm với vụn đá hoa (thành phần chính là Calcium carbonate) và dung dịch hydrochloric acid.

Thí nghiệm 1: Dùng 0,5 gam vụn đá hoa và 50mL dung dịch hydrochloric acid 1M.
Thí nghiệm 2: Dùng 0,5 gam vụn đá hoa đã được nghiền nhỏ và 50mL dung dịch hydrochloric acid 1M.

Sau đó, nhóm nghiên cứu đã đo thể tích khí sinh ra theo thời gian và xây dựng đồ thị như hình.`,
    options: tfOptions(
      "Yếu tố chính làm thay đổi tốc độ phản ứng giữa 2 thí nghiệm trên là diện tích tiếp xúc của vụn đá hoa.",
      "Tốc độ phản ứng trung bình trong 100 giây đầu tiên của thí nghiệm 1 và 2 lần lượt là 0,7 (cm3/s) và 0,8 (cm3/s).",
      "Thí nghiệm 1 có đồ thị ứng với đường (a), thí nghiệm 2 ứng với đường (b).",
      "Khi phản ứng kết thúc hoàn toàn, tổng thể tích khí CO2 thu được ở cả hai thí nghiệm là bằng nhau vì lượng đá hoa dùng là như nhau."
    ),
    correct_answer: { a: true, b: true, c: false, d: true },
    points: 1,
    needs_review: true,
    explanation: "Hướng dẫn giải: Đúng, Đúng, Sai, Đúng.",
    sort_order: 19
  },
  {
    section: "Phần II",
    question_number: 20,
    question_type: "true_false",
    prompt: `Theo Tiêu chuẩn Việt Nam TCVN 7624 : 2007, khi chế tạo gương, chiều dày lớp bạc phủ trên bề mặt tấm kính phải đạt tối thiểu 0,7 g/m2. Một công ty cần sản xuất 30 000 m2 gương có độ dày lớp bạc phủ ở mức 0,75 g/m2.

Để tạo ra bạc, người ta tiến hành theo sơ đồ phản ứng như hình:
Saccharose + H2O; xt H+, t° → dung dịch A → trung hòa acid → dung dịch B + dd[Ag(NH3)2]OH, t° dư → Ag.

Biết hiệu suất cả quá trình là 75%.`,
    options: tfOptions(
      "Trong phản ứng tạo Ag từ dung dịch B, các monosaccharide đóng vai trò là chất oxi hóa.",
      "Dung dịch A chỉ gồm duy nhất một monosaccharide.",
      "Dung dịch A có khả năng hòa tan Cu(OH)2 ở nhiệt độ thường tạo dung dịch màu xanh lam.",
      "Để tráng 30 000 m2 gương với định mức 0,75 g/m2 và hiệu suất toàn bộ quá trình là 75%, khối lượng saccharose cần dùng theo lý thuyết là 35,625 kg."
    ),
    correct_answer: { a: false, b: false, c: true, d: false },
    points: 1,
    needs_review: true,
    explanation: "Hướng dẫn giải: Sai, Sai, Đúng, Sai. Đáp án tính khối lượng saccharose là 23,75 kg.",
    sort_order: 20
  },
  {
    section: "Phần II",
    question_number: 21,
    question_type: "true_false",
    prompt:
      "Cho sơ đồ (1) biểu diễn sự điện phân dung dịch CuSO4(aq) với điện cực trơ, sơ đồ (2) biểu diễn quá trình tinh luyện đồng (Cu) bằng phương pháp điện phân. Trong sơ đồ (2), các khối đồng có độ tinh khiết thấp được gắn với một điện cực của nguồn điện, các thanh đồng mỏng có độ tinh khiết cao được gắn với một điện cực của nguồn điện. Dung dịch điện phân là dung dịch CuSO4.",
    options: tfOptions(
      "Trong sơ đồ (2), tổng khối lượng của thanh đồng tinh khiết (cathode) tăng lên luôn đúng bằng tổng khối lượng của khối đồng không tinh khiết (anode) giảm đi.",
      "Để thanh đồng tinh khiết ở sơ đồ (2) ngày càng dày lên, ta phải duy trì dòng điện xoay chiều đi qua hệ thống.",
      "Trong sơ đồ (1), màu xanh lam của dung dịch CuSO4 sẽ nhạt dần theo thời gian điện phân.",
      "Ở sơ đồ (1), sau một thời gian điện phân, pH của dung dịch tại khu vực gần anode (+) sẽ giảm xuống."
    ),
    correct_answer: { a: false, b: false, c: true, d: true },
    points: 1,
    needs_review: true,
    explanation: "Hướng dẫn giải: Sai, Sai, Đúng, Đúng.",
    sort_order: 21
  },
  {
    section: "Phần II",
    question_number: 22,
    question_type: "true_false",
    prompt:
      "Isopropyl myristate là một ester thường được sử dụng trong kem dưỡng da, dầu tẩy trang và sản phẩm chăm sóc tóc như một chất làm mềm, chất kết dính và chất tăng hương thơm vì khả năng thẩm thấu tốt mà không gây nhờn rít. Ester này được tạo ra từ phản ứng giữa acid béo bão hòa myristic và isopropyl alcohol. Công thức khung phân tử của isopropyl myristate như hình.",
    options: tfOptions(
      "Khi thủy phân isopropyl myristate trong môi trường kiềm (NaOH) đun nóng, sản phẩm thu được gồm sodium myristate và propan-2-ol (isopropyl alcohol).",
      "Nếu sản xuất 1000 lọ kem (100 mL/lọ, khối lượng riêng 0,85 g/mL) với nồng độ 3% isopropyl myristate, thì tổng khối lượng ester cần dùng là 2,55 kg.",
      "Isopropyl myristate có công thức phân tử là C16H32O2.",
      "Phản ứng ester hóa giữa myristic acid và isopropyl alcohol là phản ứng một chiều, xảy ra hoàn toàn khi có xúc tác H2SO4 đặc."
    ),
    correct_answer: { a: true, b: true, c: false, d: false },
    points: 1,
    needs_review: true,
    explanation: "Hướng dẫn giải: Đúng, Đúng, Sai, Sai. CTPT đúng là C17H34O2.",
    sort_order: 22
  },
  {
    section: "Phần III",
    question_number: 23,
    question_type: "short_answer",
    prompt:
      "Nescafe đã sản xuất thành công lon coffee tự làm nóng. Để làm nóng coffee, chỉ cần ấn nút để trộn nguyên liệu gồm dung dịch KOH hoặc NaOH rất loãng và CaO; 250 mL coffee trong lon sẽ được hâm nóng đến khoảng 40°C. Giả sử nhiệt dung riêng của coffee là 4,18 J/g.K. Cho ΔfH°298 (kJ.mol-1) của CaO, H2O(l), Ca(OH)2 lần lượt là -635; -286; -985. Nhiệt tỏa ra từ phản ứng thất thoát vào sản phẩm, vỏ hộp và môi trường là 20%. Tính khối lượng CaO theo gam cần cung cấp để làm nóng 250 mL coffee từ 10°C đến 40°C (d = 1,0 g/ml). Làm tròn đến hàng đơn vị.",
    options: [],
    correct_answer: "34",
    points: 0.5,
    explanation: "Hướng dẫn giải trong file ghi đáp án 34.",
    sort_order: 23
  },
  {
    section: "Phần III",
    question_number: 24,
    question_type: "short_answer",
    prompt:
      "Các chất X, Y là các hợp chất hữu cơ (đều chứa nguyên tố oxygen trong phân tử) thỏa mãn sơ đồ như hình. Biết Y là hợp chất ở trạng thái rắn ở điều kiện thường. Phân tử khối của Y là bao nhiêu?",
    options: [],
    correct_answer: "112",
    points: 0.5,
    needs_review: true,
    explanation: "Hướng dẫn giải ghi đáp án 112.",
    sort_order: 24
  },
  {
    section: "Phần III",
    question_number: 25,
    question_type: "short_answer",
    prompt:
      "Adrenaline là hormone dẫn truyền thần kinh chủ yếu được tiết ra bởi tuyến thượng thận. Nó đóng vai trò quan trọng trong phản ứng “chiến hoặc chạy” của cơ thể. Số lượng nhóm chức -OH thuộc loại alcohol trong chất trên là bao nhiêu?",
    options: [],
    correct_answer: "1",
    points: 0.5,
    needs_review: true,
    explanation: "Hướng dẫn giải ghi đáp án 1.",
    sort_order: 25
  },
  {
    section: "Phần III",
    question_number: 26,
    question_type: "short_answer",
    prompt:
      "Trong một đề tài khôi phục nước trên sao hỏa của NASA. Tiến hành sấy các mẫu Iron(II) sulfate heptahydrate (FeSO4.7H2O) với độ tinh khiết 99,99% với các khoảng nhiệt độ tăng dần, người ta xử lý số liệu độ giảm khối lượng của chất rắn thu được đồ thị như hình. Giá trị của y là bao nhiêu?",
    options: [],
    correct_answer: "1",
    points: 0.5,
    needs_review: true,
    explanation: "Hướng dẫn giải ghi đáp án 1.",
    sort_order: 26
  },
  {
    section: "Phần III",
    question_number: 27,
    question_type: "short_answer",
    prompt:
      "Cho các vật liệu polymer thuộc loại chất dẻo mô tả như hình. Các polymer này có thể tái chế được. Các nhận định: (1) Sáu polymer trên đều là polymer nhiệt dẻo. (2) Trong 6 polymer trên, có 4 polymer tạo từ các monomer là hydrocarbon. (3) Nhựa số 3 (PVC) là loại polymer an toàn nhất để dùng làm màng bọc thực phẩm và có thể đốt cháy tại nhà để xử lý rác thải. (4) Monomer dùng để tổng hợp HDPE, LDPE là CH2=CH2. Sắp xếp các nhận định đúng theo thứ tự tăng dần.",
    options: [],
    correct_answer: "124",
    points: 0.5,
    needs_review: true,
    explanation: "Hướng dẫn giải ghi đáp án 124.",
    sort_order: 27
  },
  {
    section: "Phần III",
    question_number: 28,
    question_type: "short_answer",
    prompt: `Các kim loại X, Y, Z, T được đánh số thứ tự lần lượt từ 1 đến 4. Cho các pin điện hoá và sức điện động chuẩn tương ứng:

Pin điện hóa | X-Y | T-X | Z-X
Sức điện động chuẩn (V) | 0,32 | 0,46 | 1,24

Sắp xếp các kim loại theo chiều giảm dần tính khử từ trái sang phải thành một bộ 4 số.`,
    options: [],
    correct_answer: "3412",
    points: 0.5,
    explanation: "Hướng dẫn giải trong file ghi đáp án 3412.",
    sort_order: 28
  }
];


const hungYenQuestions: SampleQuestion[] = [
  { section: "Phần I", question_number: 1, question_type: "single_choice", prompt: "Carbohydrate là những hợp chất hữu cơ tạp chức hầu hết có công thức chung là", options: choice("R(OH)x(CHO)y", "C2H2O2", "Cn(H2O)m", "CnH2O"), correct_answer: "C", points: 0.25, sort_order: 1 },
  { section: "Phần I", question_number: 2, question_type: "single_choice", prompt: "Có bao nhiêu dipeptide mạch hở khi thủy phân hoàn toàn thu được hỗn hợp chỉ gồm glycine và alanine?", options: choice("4", "2", "3", "1"), correct_answer: "B", points: 0.25, sort_order: 2 },
  { section: "Phần I", question_number: 3, question_type: "single_choice", prompt: "Chất nào sau đây là amine bậc một?", options: choice("C6H5NH2", "(CH3)3N", "CH3NHC2H5", "(CH3)2NH"), correct_answer: "A", points: 0.25, sort_order: 3 },
  { section: "Phần I", question_number: 4, question_type: "single_choice", prompt: "Giá trị thế điện cực chuẩn của cặp oxi hoá - khử nào được quy ước bằng 0 V?", options: choice("Na+/Na", "Cu2+/Cu", "2H+/H2", "Al3+/Al"), correct_answer: "C", points: 0.25, sort_order: 4 },
  { section: "Phần I", question_number: 5, question_type: "single_choice", prompt: "Cho một số tính chất: có dạng sợi (1); tan trong nước (2); tan trong nước Schweizer (3); phản ứng với nitric acid đặc (xúc tác sulfuric acid đặc) (4); tham gia phản ứng với thuốc thử Tollens (5); bị thủy phân trong dung dịch acid đun nóng (6). Các tính chất của cellulose là", options: choice("(1), (3), (4) và (6)", "(3), (4), (5) và (6)", "(1), (2), (3) và (4)", "(2), (3), (4) và (5)"), correct_answer: "A", points: 0.25, sort_order: 5 },
  { section: "Phần I", question_number: 6, question_type: "single_choice", prompt: "Cho các chất sau: saccharose, glycine, acetic acid, ethyl formate, aniline. Số chất tác dụng với dung dịch NaOH trong điều kiện thích hợp là", options: choice("3", "2", "4", "1"), correct_answer: "A", points: 0.25, sort_order: 6 },
  { section: "Phần I", question_number: 7, question_type: "single_choice", prompt: "Tơ nào sau đây thuộc loại tơ thiên nhiên?", options: choice("Tơ nitron (hay olon)", "Tơ visco", "Tơ tằm", "Tơ nylon-6,6"), correct_answer: "C", points: 0.25, sort_order: 7 },
  { section: "Phần I", question_number: 8, question_type: "single_choice", prompt: "Kí hiệu cặp oxi hoá - khử ứng với quá trình khử: Fe3+ + 1e ⇌ Fe2+ là", options: choice("Fe2+/Fe3+", "Fe3+/Fe", "Fe3+/Fe2+", "Fe2+/Fe"), correct_answer: "C", points: 0.25, sort_order: 8 },
  { section: "Phần I", question_number: 9, question_type: "single_choice", prompt: "Thủy phân ester X trong dung dịch acid, thu được sản phẩm gồm CH3COOH và CH3OH. Công thức cấu tạo của X là", options: choice("CH3COOC2H5", "CH3COOCH3", "HCOOC2H5", "C2H5COOCH3"), correct_answer: "B", points: 0.25, sort_order: 9 },
  { section: "Phần I", question_number: 10, question_type: "single_choice", prompt: "Hợp chất nào dưới đây thuộc loại ester?", options: choice("CH3CH2CH2COOH", "CH3CH2COOCH3", "CH3CH2OH", "CH3CH2CHO"), correct_answer: "B", points: 0.25, sort_order: 10 },
  { section: "Phần I", question_number: 11, question_type: "single_choice", prompt: "Hợp chất H2NCH2COOH có tên gọi thông thường là", options: choice("glycine", "lysine", "valine", "alanine"), correct_answer: "A", points: 0.25, sort_order: 11 },
  { section: "Phần I", question_number: 12, question_type: "single_choice", prompt: "Cho biết: E₀(Fe²⁺/Fe) = -0,440V; E₀(Cu²⁺/Cu) = +0,340V. Sức điện động chuẩn của pin điện hoá Fe - Cu là", options: choice("0,780 V", "0,920 V", "0,100 V", "1,660 V"), correct_answer: "A", points: 0.25, sort_order: 12 },
  { section: "Phần I", question_number: 13, question_type: "single_choice", prompt: "Phát biểu nào sau đây là không đúng?", options: choice("Amylopectin (có trong tinh bột) có cấu trúc mạch phân nhánh.", "Tơ nitron (hay olon) thường được dùng để dệt vải may quần áo ấm hoặc bện thành sợi \"len\" đan áo rét.", "Tơ nylon-6 được điều chế bằng phản ứng trùng ngưng omega-aminocaproic acid.", "Cao su buna-N có tính đàn hồi tốt hơn và bền với dầu mỡ hơn cao su buna thường."), correct_answer: "D", points: 0.25, sort_order: 13 },
  { section: "Phần I", question_number: 14, question_type: "single_choice", prompt: "Khi nghiên cứu về carbohydrate X, nhận thấy:\n- X thủy phân hoàn toàn trong dung dịch acid thu được hai sản phẩm hữu cơ.\n- X không có phản ứng với thuốc thử Tollens.\nVậy X có thể là", options: choice("fructose", "cellulose", "saccharose", "tinh bột"), correct_answer: "C", points: 0.25, sort_order: 14 },
  { section: "Phần I", question_number: 15, question_type: "single_choice", prompt: "Glucose là một loại monosaccharide có nhiều trong quả nho chín. Công thức phân tử của glucose là", options: choice("(C6H10O5)n", "C2H4O2", "C6H12O6", "C12H22O11"), correct_answer: "C", points: 0.25, sort_order: 15 },
  { section: "Phần I", question_number: 16, question_type: "single_choice", prompt: "Tính chất vật lý chung của chất béo là", options: choice("Dễ tan trong nước và nhẹ hơn nước", "Dễ tan trong nước và nặng hơn nước", "Ít tan trong nước và nhẹ hơn nước", "Ít tan trong nước và nặng hơn nước"), correct_answer: "C", points: 0.25, sort_order: 16 },
  { section: "Phần I", question_number: 17, question_type: "single_choice", prompt: "Chất nào sau đây có khả năng tham gia phản ứng trùng hợp tạo thành polymer?", options: choice("CH3-CH3", "CH3-CH2-OH", "CH2=CH2", "CH3-COOH"), correct_answer: "C", points: 0.25, sort_order: 17 },
  { section: "Phần I", question_number: 18, question_type: "single_choice", prompt: "Trong các chất sau đây, chất nào có nhiệt độ sôi cao nhất?", options: choice("CH3CHO", "CH3COOH", "CH3CH2OH", "CH3COOC2H5"), correct_answer: "B", points: 0.25, sort_order: 18 },
  { section: "Phần II", question_number: 19, question_type: "true_false", prompt: "Trong một loại pin cúc áo được sử dụng rộng rãi trong đồng hồ và các thiết bị xảy ra phản ứng:\nZn(s) + Ag2O(s) + 2OH-(aq) -> ZnO2(2-)(aq) + 2Ag(s) + H2O(l)\nCho biết các giá trị thế điện cực chuẩn:\nZnO2(2-) + 2H2O + 2e ⇌ Zn + 4OH-, E° = -1,216 V\nAg2O + H2O + 2e ⇌ 2Ag + 2OH-, E° = +0,342 V\nPin chứa 0,49 gam kẽm và có khả năng chạy được cho đến khi 80% lượng kẽm được tiêu thụ ở cường độ dòng điện là 0,03 mA. Cho q = I.t = n(e).F; F = 96500 C/mol.", options: tfOptions("Thế điện cực chuẩn của pin là 1,558 V.", "Zn là điện cực âm, Ag2O là điện cực dương.", "Khi pin hoạt động, tại cathode xảy ra quá trình khử Ag2O + H2O + 2e -> 2Ag + 2OH-.", "Thời gian pin có thể chạy được tối đa là 446,76 ngày."), correct_answer: { a: true, b: true, c: false, d: false }, points: 1, sort_order: 19 },
  { section: "Phần II", question_number: 20, question_type: "true_false", prompt: "Điều chế ethyl acetate trong phòng thí nghiệm được tiến hành như sau:\n- Bước 1: Cho khoảng 5 mL ethanol và 5 mL acetic acid tuyệt đối vào ống nghiệm, lắc đều hỗn hợp.\n- Bước 2: Thêm khoảng 2 mL dung dịch H2SO4 đặc, lắc nhẹ để các chất trộn đều với nhau.\n- Bước 3: Đặt ống nghiệm vào cốc nước nóng khoảng 60°C - 70°C trong khoảng 5 phút, thỉnh thoảng lắc đều hỗn hợp. Sau đó lấy ống nghiệm ra khỏi cốc nước nóng, để nguội hỗn hợp rồi rót sang ống nghiệm khác chứa 10 mL dung dịch muối ăn bão hòa thì thấy chất lỏng trong ống nghiệm tách thành hai lớp, lớp trên có mùi thơm đặc trưng.\nPhản ứng xảy ra trong thí nghiệm: CH3COOH(l) + C2H5OH(l) ⇌ CH3COOC2H5(l) + H2O(l), Kc = 4.\nCho phổ IR của hai hợp chất hữu cơ trong phản ứng và bảng số sóng hấp thụ đặc trưng như hình.", options: tfOptions("Phổ IR trong hình 1 là của C2H5OH, hình 2 là của CH3COOH.", "Sulfuric acid đặc vừa là chất xúc tác, vừa có tác dụng hút nước, làm tăng hiệu suất tạo ester.", "Ban đầu, nếu cho 0,625 mol acetic acid tác dụng với 1 mol ethanol thì khi đạt đến trạng thái cân bằng, hiệu suất phản ứng ester hóa là 75%.", "Dung dịch NaCl bão hòa giúp ester tạo thành tách lớp nổi lên trên tốt hơn."), correct_answer: { a: false, b: true, c: false, d: true }, points: 1, sort_order: 20 },
  { section: "Phần II", question_number: 21, question_type: "true_false", prompt: "Tơ nylon-6,6 là loại tơ có tính dai, bền, mềm mại, óng mượt, ít thấm nước, giặt mau khô và được sử dụng để dệt vải may mặc, làm dây dù, đan lưới. Tơ nylon-6,6 được tổng hợp theo phương trình hóa học:\nn H2N-[CH2]6-NH2 + n HOOC-[CH2]4-COOH -> (-HN-[CH2]6-NH-CO-[CH2]4-CO-)n + 2n H2O.", options: tfOptions("Tơ nylon-6,6 được điều chế từ hexamethylenediamine và adipic acid.", "Phản ứng tổng hợp tơ nylon-6,6 thuộc loại phản ứng trùng hợp.", "Tơ nylon-6,6 thường được dùng để dệt vải may mặc, bện dây dù, đan lưới do có tính dai và bền.", "Tơ nylon-6,6 và tơ tằm đều kém bền trong môi trường kiềm nóng."), correct_answer: { a: true, b: false, c: true, d: true }, points: 1, sort_order: 21 },
  { section: "Phần II", question_number: 22, question_type: "true_false", prompt: "Amine thơm X (C6H7N), ở điều kiện thường là chất lỏng, dễ bị oxi hóa khi để ngoài không khí.", options: tfOptions("X làm chuyển màu quỳ tím sang màu xanh.", "X tác dụng với nước bromine tạo kết tủa trắng.", "X tác dụng với nitrous acid ở nhiệt độ thấp (0-5°C) tạo thành muối diazonium, là phản ứng quan trọng trong sản xuất thuốc nhuộm azo.", "Tên thay thế của X là phenylamine."), correct_answer: { a: false, b: true, c: true, d: false }, points: 1, sort_order: 22 },
  { section: "Phần III", question_number: 23, question_type: "short_answer", prompt: "Indigo dye (hình 1) là một loại thuốc nhuộm màu xanh lam đậm có nguồn gốc tự nhiên từ một số loài thực vật, hoặc có thể được sản xuất tổng hợp. Phần trăm khối lượng của nguyên tố nitrogen trong phân tử Indigo dye là bao nhiêu phần trăm? Làm tròn đến hàng phần mười.", options: [], correct_answer: "10,7", points: 0.5, sort_order: 23 },
  { section: "Phần III", question_number: 24, question_type: "short_answer", prompt: "Poly(vinyl chloride) (PVC) được điều chế từ khí thiên nhiên theo sơ đồ như hình. Cần bao nhiêu m3 khí thiên nhiên (đo ở điều kiện chuẩn: 25°C, 1 bar) để điều chế được 450 kg PVC? Biết khí thiên nhiên chứa 92% methane về thể tích, còn lại là tạp chất trơ. Làm tròn đến hàng đơn vị.", options: [], correct_answer: "3003", points: 0.5, sort_order: 24 },
  { section: "Phần III", question_number: 25, question_type: "short_answer", prompt: "Cho các cặp oxi hoá - khử và giá trị thế điện cực chuẩn tương ứng:\nCặp oxi hoá khử | Cu2+/Cu | Fe3+/Fe2+ | Ag+/Ag\nThế điện cực chuẩn (V) | +0,34 | +0,771 | +0,799\nCho các phát biểu sau ở điều kiện chuẩn:\n(1) Ion Cu2+ có tính oxi hoá mạnh hơn ion Fe3+.\n(2) Dãy sắp xếp theo chiều tăng dần tính khử: Ag, Cu, Fe2+.\n(3) Ion Fe2+ khử được ion Ag+ thành Ag kim loại.\n(4) Ion Fe3+ và ion Ag+ đều oxi hoá được Cu thành ion Cu2+.\nViết số thứ tự của các phát biểu đúng theo thứ tự tăng dần từ trái sang phải.", options: [], correct_answer: "34", points: 0.5, sort_order: 25 },
  { section: "Phần III", question_number: 26, question_type: "short_answer", prompt: "Cho các ester sau: C6H5COOC6H5 (phenyl benzoate); CH3COO-[CH2]2-OOCCH2CH3; CH3COOC6H5 (phenyl acetate); CH3OOC-COOCH3; HCOO-CH2-C6H5. Số ester khi tác dụng với dung dịch NaOH dư thu được alcohol là bao nhiêu?", options: [], correct_answer: "3", points: 0.5, sort_order: 26 },
  { section: "Phần III", question_number: 27, question_type: "short_answer", prompt: "Cho các phát biểu sau:\n(1) Mỡ lợn hoặc dầu dừa có thể dùng làm nguyên liệu để tái chế thành xà phòng.\n(2) Nước ép quả nho chín có khả năng tham gia phản ứng với thuốc thử Tollens.\n(3) Trong phân tử peptide mạch hở Gly-Ala-Gly, có 3 nguyên tử oxygen.\n(4) Tơ nylon-6,6 và tơ nitron (hay olon) đều thuộc loại tơ polyamide.\n(5) Aniline (C6H5NH2) phản ứng với nước bromine tạo thành kết tủa trắng.\n(6) Cao su lưu hóa có cấu trúc mạng lưới không gian nên đàn hồi tốt hơn cao su thường.\nLiệt kê các phát biểu đúng theo thứ tự tăng dần.", options: [], correct_answer: "126", points: 0.5, sort_order: 27 },
  { section: "Phần III", question_number: 28, question_type: "short_answer", prompt: "Dung dịch saccharose không phản ứng với thuốc thử Tollens, nhưng khi đun nóng với dung dịch acid loãng thì tạo thành dung dịch phản ứng với thuốc thử Tollens. Thủy phân hoàn toàn 0,5 mol saccharose thu được dung dịch X. X tác dụng hoàn toàn với dung dịch AgNO3/NH3 dư thu được a mol Ag. Giá trị của a là bao nhiêu?", options: [], correct_answer: "2", points: 0.5, sort_order: 28 }
];
const week2Exams = week2ExamData as SampleExam[];
const week3Exams = week3ExamData as SampleExam[];
const week4Exams = week4ExamData as SampleExam[];

export const sampleGiupCyExams: SampleExam[] = [
  {
    title: "17.05.01",
    description:
      "Đề được dựng lại đủ 28 câu từ nguồn Word. Bản dữ liệu 2026-05-17 đã bổ sung crop hình/sơ đồ cho cụm câu phụ thuộc ảnh và bỏ tham chiếu mơ hồ.",
    subject: "Hóa học",
    duration_minutes: 50,
    slugSuffix: "hung-yen-hki-hoa-12-2026",
    source_file_name: "05.2025-2026 Cuối Học Kì 1 Sở Hưng Yên - đề.docx",
    is_active: false,
    questions: hungYenQuestions
  },
  {
    title: "17.05.02",
    description:
      "Đề Cẩm Phả được dựng đủ 28 câu. Bản dữ liệu 2026-05-17 đã dùng ảnh trích từ nguồn Word cho các câu phụ thuộc hình/sơ đồ và bỏ tham chiếu mơ hồ.",
    subject: "Hóa học",
    duration_minutes: 50,
    slugSuffix: "cam-pha-lan-1-hoa-2026",
    source_file_name: "22. THPT CẨM PHẢ (LẦN 1) - QUẢNG NINH - [Thi thử Tốt Nghiệp THPT 2026 - Môn Hóa Học ].Image.Marked.docx",
    is_active: true,
    questions: camPhaQuestions
  },
  ...week2Exams,
  ...week3Exams,
  ...week4Exams
];
