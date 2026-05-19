import type { GiupCyExamRow } from "@/types/database";
import week2AssetsData from "./week-2-assets.json";

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

type Week2Asset = {
  slug: string;
  sourceFileName: string;
  questionAssets: Record<string, ExamPageAsset>;
};

const ASSET_VERSION = "student-clean-20260516";
const CROP_ASSET_VERSION = "question-crops-20260519b";
const week2Assets = week2AssetsData as Record<string, Week2Asset>;

function buildPages(basePath: string, count: number, width: number, height: number, padded = true) {
  return Array.from({ length: count }, (_, index) => {
    const pageNumber = index + 1;
    return {
      pageNumber,
      url: `${basePath}/pages/page-${padded ? String(pageNumber).padStart(2, "0") : String(pageNumber)}.png?v=${ASSET_VERSION}`,
      width,
      height
    };
  });
}

function getWeek2Asset(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();
  return Object.values(week2Assets).find((asset) => source.includes(asset.slug) || source.includes(asset.sourceFileName.toLowerCase())) ?? null;
}

export function getExamDocumentAsset(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">): ExamDocumentAsset | null {
  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();

  if (source.includes("cam-pha")) {
    return {
      pdfUrl: `/exam-assets/cam-pha-lan-1/original.pdf?v=${ASSET_VERSION}`,
      pages: buildPages("/exam-assets/cam-pha-lan-1", 15, 1445, 1870)
    };
  }

  if (source.includes("hung-yen")) {
    return {
      pdfUrl: `/exam-assets/hung-yen-hki/original.pdf?v=${ASSET_VERSION}`,
      pages: buildPages("/exam-assets/hung-yen-hki", 4, 1445, 1870, false)
    };
  }

  return null;
}

export function getExamPdfUrl(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  return getExamDocumentAsset(exam)?.pdfUrl ?? null;
}

export function getQuestionSourceAsset(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">, questionNumber: number): ExamPageAsset | null {
  const week2Asset = getWeek2Asset(exam);
  const week2QuestionAsset = week2Asset?.questionAssets[String(questionNumber)];
  if (week2QuestionAsset) return week2QuestionAsset;

  const documentAsset = getExamDocumentAsset(exam);
  if (!documentAsset) return null;

  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();

  if (source.includes("cam-pha")) {
    const cropSizes: Record<number, Pick<ExamPageAsset, "url" | "width" | "height">> = {
      17: { url: `/exam-assets/cam-pha-lan-1/crops/q17.png?v=${CROP_ASSET_VERSION}`, width: 1457, height: 294 },
      19: { url: `/exam-assets/cam-pha-lan-1/crops/q19.png?v=${CROP_ASSET_VERSION}`, width: 580, height: 373 },
      20: { url: `/exam-assets/cam-pha-lan-1/crops/q20.png?v=${CROP_ASSET_VERSION}`, width: 1210, height: 75 },
      21: { url: `/exam-assets/cam-pha-lan-1/crops/q21.png?v=${CROP_ASSET_VERSION}`, width: 1192, height: 408 },
      22: { url: `/exam-assets/cam-pha-lan-1/crops/q22.png?v=${CROP_ASSET_VERSION}`, width: 876, height: 130 },
      24: { url: `/exam-assets/cam-pha-lan-1/crops/q24.png?v=${CROP_ASSET_VERSION}`, width: 632, height: 64 },
      25: { url: `/exam-assets/cam-pha-lan-1/crops/q25.png?v=${CROP_ASSET_VERSION}`, width: 480, height: 220 },
      26: { url: `/exam-assets/cam-pha-lan-1/crops/q26.png?v=${CROP_ASSET_VERSION}`, width: 979, height: 576 },
      27: { url: `/exam-assets/cam-pha-lan-1/crops/q27.png?v=${CROP_ASSET_VERSION}`, width: 1225, height: 168 }
    };

    const crop = cropSizes[questionNumber];
    if (crop) return { pageNumber: estimateQuestionPage(questionNumber, documentAsset.pages.length), ...crop };

    return null;
  }

  if (source.includes("hung-yen")) {
    const cropSizes: Record<number, Pick<ExamPageAsset, "url" | "width" | "height">> = {
      20: { url: `/exam-assets/hung-yen-hki/crops/q20.png?v=${CROP_ASSET_VERSION}`, width: 1400, height: 637 },
      21: { url: `/exam-assets/hung-yen-hki/crops/q21.png?v=${CROP_ASSET_VERSION}`, width: 1210, height: 150 },
      23: { url: `/exam-assets/hung-yen-hki/crops/q23.png?v=${CROP_ASSET_VERSION}`, width: 751, height: 413 },
      24: { url: `/exam-assets/hung-yen-hki/crops/q24.png?v=${CROP_ASSET_VERSION}`, width: 1200, height: 84 },
      25: { url: `/exam-assets/hung-yen-hki/crops/q25.png?v=${CROP_ASSET_VERSION}`, width: 1200, height: 420 }
    };

    const crop = cropSizes[questionNumber];
    if (crop) return { pageNumber: estimateQuestionPage(questionNumber, documentAsset.pages.length), ...crop };

    return null;
  }

  return null;
}

export function estimateQuestionPage(questionNumber: number, pageCount: number) {
  if (pageCount >= 15) {
    if (questionNumber <= 6) return 1;
    if (questionNumber <= 14) return 2;
    if (questionNumber <= 19) return 3;
    if (questionNumber <= 21) return 4;
    if (questionNumber <= 24) return 5;
    if (questionNumber <= 27) return 6;
    return 7;
  }

  if (questionNumber <= 14) return 1;
  if (questionNumber <= 20) return 2;
  if (questionNumber <= 24) return 3;
  return Math.min(pageCount, 4);
}
