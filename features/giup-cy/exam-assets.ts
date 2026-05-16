import type { GiupCyExamRow } from "@/types/database";

export type ExamPageAsset = {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
};

export type ExamDocumentAsset = {
  pdfUrl: string;
  pages: ExamPageAsset[];
};

function buildPages(basePath: string, count: number, width: number, height: number, padded = true) {
  return Array.from({ length: count }, (_, index) => {
    const pageNumber = index + 1;
    return {
      pageNumber,
      url: `${basePath}/pages/page-${padded ? String(pageNumber).padStart(2, "0") : String(pageNumber)}.png`,
      width,
      height
    };
  });
}

export function getExamDocumentAsset(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">): ExamDocumentAsset | null {
  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();

  if (source.includes("cam-pha")) {
    return {
      pdfUrl: "/exam-assets/cam-pha-lan-1/original.pdf",
      pages: buildPages("/exam-assets/cam-pha-lan-1", 15, 1445, 1870)
    };
  }

  if (source.includes("hung-yen")) {
    return {
      pdfUrl: "/exam-assets/hung-yen-hki/original.pdf",
      pages: buildPages("/exam-assets/hung-yen-hki", 4, 1406, 1988, false)
    };
  }

  return null;
}

export function getExamPdfUrl(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  return getExamDocumentAsset(exam)?.pdfUrl ?? null;
}

export function estimateQuestionPage(questionNumber: number, pageCount: number) {
  if (pageCount >= 15) {
    if (questionNumber <= 6) return 1;
    if (questionNumber <= 13) return 2;
    if (questionNumber <= 18) return 3;
    if (questionNumber <= 19) return 4;
    if (questionNumber <= 21) return 5;
    if (questionNumber <= 22) return 6;
    if (questionNumber <= 24) return 7;
    if (questionNumber <= 26) return 8;
    return 9;
  }

  return Math.min(pageCount, Math.max(1, Math.ceil(questionNumber / 7)));
}
