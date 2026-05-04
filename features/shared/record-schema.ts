import type { TableName } from "@/types/database";

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "lines";

export type RecordField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  list?: boolean;
  wide?: boolean;
};

export type TableSchema = {
  table: TableName;
  titleField: string;
  subtitleField?: string;
  fields: RecordField[];
  defaultValues?: Record<string, unknown>;
};

export const statusOptions = [
  { label: "Cần làm", value: "todo" },
  { label: "Đang làm", value: "doing" },
  { label: "Hoàn tất", value: "done" }
];

export const financeTypeOptions = [
  { label: "Thu nhập", value: "income" },
  { label: "Chi tiêu", value: "expense" },
  { label: "Tiết kiệm", value: "saving" }
];

export const recurringCadenceOptions = [
  { label: "Hằng ngày", value: "daily" },
  { label: "Hằng tuần", value: "weekly" },
  { label: "Hằng tháng", value: "monthly" },
  { label: "Hằng quý", value: "quarterly" },
  { label: "Hằng năm", value: "yearly" }
];

export const energyCategoryOptions = [
  { label: "Giải tỏa cảm xúc", value: "emotional_release" },
  { label: "Nhịp cơ thể", value: "body_rhythm" },
  { label: "Dòng tưởng tượng", value: "imagination_flow" },
  { label: "Tĩnh sâu khi làm việc", value: "deep_work_calm" },
  { label: "Luyện kỹ năng", value: "skill_drilling" },
  { label: "Học thực dụng", value: "practical_learning" }
];

export const tableSchemas = {
  tasks: {
    table: "tasks",
    titleField: "title",
    subtitleField: "category",
    defaultValues: { status: "todo", category: "Công việc", priority: 3 },
    fields: [
      { name: "title", label: "Tên nhiệm vụ", type: "text", required: true, placeholder: "Việc quan trọng cần hoàn thành", list: true, wide: true },
      { name: "status", label: "Trạng thái", type: "select", required: true, options: statusOptions, list: true },
      { name: "category", label: "Nhóm", type: "text", required: true, placeholder: "Công việc, học tập, cá nhân...", list: true },
      { name: "priority", label: "Ưu tiên", type: "number", required: true, min: 1, max: 5, step: 1, list: true },
      { name: "due_on", label: "Hạn xử lý", type: "date", list: true },
      { name: "notes", label: "Ghi chú", type: "textarea", placeholder: "Bối cảnh, tiêu chí hoàn thành...", wide: true }
    ]
  },
  daily_priorities: {
    table: "daily_priorities",
    titleField: "title",
    subtitleField: "planned_on",
    defaultValues: { rank: 1, completed: false, planned_on: new Date().toISOString().slice(0, 10) },
    fields: [
      { name: "title", label: "Ưu tiên", type: "text", required: true, placeholder: "Một việc thật sự đáng làm hôm nay", list: true, wide: true },
      { name: "rank", label: "Thứ tự", type: "number", required: true, min: 1, max: 3, step: 1, list: true },
      { name: "completed", label: "Đã hoàn tất", type: "checkbox", list: true },
      { name: "planned_on", label: "Ngày", type: "date", required: true, list: true }
    ]
  },
  finance_entries: {
    table: "finance_entries",
    titleField: "category",
    subtitleField: "occurred_on",
    defaultValues: { type: "expense", occurred_on: new Date().toISOString().slice(0, 10) },
    fields: [
      { name: "type", label: "Loại", type: "select", required: true, options: financeTypeOptions, list: true },
      { name: "category", label: "Danh mục", type: "text", required: true, placeholder: "Lương, ăn uống, học tập...", list: true },
      { name: "amount", label: "Số tiền", type: "number", required: true, min: 0, step: 1000, list: true },
      { name: "occurred_on", label: "Ngày", type: "date", required: true, list: true },
      { name: "notes", label: "Ghi chú", type: "textarea", placeholder: "Lý do, cảm nhận, quyết định tiếp theo...", wide: true }
    ]
  },
  health_logs: {
    table: "health_logs",
    titleField: "logged_on",
    defaultValues: { logged_on: new Date().toISOString().slice(0, 10), sleep_hours: 7, water_liters: 2, steps: 6000, workouts_count: 0, energy_score: 70 },
    fields: [
      { name: "logged_on", label: "Ngày", type: "date", required: true, list: true },
      { name: "sleep_hours", label: "Giờ ngủ", type: "number", required: true, min: 0, max: 16, step: 0.5, list: true },
      { name: "water_liters", label: "Lít nước", type: "number", required: true, min: 0, max: 8, step: 0.1, list: true },
      { name: "steps", label: "Số bước", type: "number", required: true, min: 0, step: 100, list: true },
      { name: "workouts_count", label: "Buổi vận động", type: "number", required: true, min: 0, max: 10, step: 1, list: true },
      { name: "energy_score", label: "Điểm năng lượng", type: "number", required: true, min: 1, max: 100, step: 1, list: true },
      { name: "notes", label: "Ghi chú cơ thể", type: "textarea", wide: true }
    ]
  },
  study_sessions: {
    table: "study_sessions",
    titleField: "topic",
    subtitleField: "occurred_on",
    defaultValues: { occurred_on: new Date().toISOString().slice(0, 10), duration_minutes: 45, weekly_target_minutes: 600 },
    fields: [
      { name: "topic", label: "Chủ đề", type: "text", required: true, placeholder: "Next.js, tiếng Anh, tài chính cá nhân...", list: true, wide: true },
      { name: "duration_minutes", label: "Thời lượng phút", type: "number", required: true, min: 1, step: 5, list: true },
      { name: "occurred_on", label: "Ngày học", type: "date", required: true, list: true },
      { name: "weekly_target_minutes", label: "Mục tiêu tuần phút", type: "number", required: true, min: 30, step: 30, list: true },
      { name: "notes", label: "Điều rút ra", type: "textarea", placeholder: "Một ý có thể dùng ngay...", wide: true }
    ]
  },
  time_logs: {
    table: "time_logs",
    titleField: "logged_on",
    defaultValues: { logged_on: new Date().toISOString().slice(0, 10), deep_work_minutes: 90, screen_time_minutes: 240 },
    fields: [
      { name: "logged_on", label: "Ngày", type: "date", required: true, list: true },
      { name: "deep_work_minutes", label: "Deep work phút", type: "number", required: true, min: 0, step: 5, list: true },
      { name: "screen_time_minutes", label: "Màn hình phút", type: "number", required: true, min: 0, step: 5, list: true },
      { name: "top_priorities", label: "Top 3 ưu tiên", type: "lines", helper: "Mỗi dòng là một ưu tiên.", list: true, wide: true },
      { name: "planning_notes", label: "Ghi chú lập kế hoạch", type: "textarea", wide: true }
    ]
  },
  relationship_logs: {
    table: "relationship_logs",
    titleField: "person_name",
    subtitleField: "action_taken",
    defaultValues: { occurred_on: new Date().toISOString().slice(0, 10), completed: true },
    fields: [
      { name: "person_name", label: "Người liên quan", type: "text", required: true, list: true },
      { name: "action_taken", label: "Hành động chăm sóc", type: "text", required: true, placeholder: "Nhắn tin hỏi thăm, gọi điện, gửi tài liệu...", list: true, wide: true },
      { name: "completed", label: "Đã thực hiện", type: "checkbox", list: true },
      { name: "occurred_on", label: "Ngày", type: "date", required: true, list: true },
      { name: "notes", label: "Ghi chú", type: "textarea", wide: true }
    ]
  },
  emotion_logs: {
    table: "emotion_logs",
    titleField: "logged_on",
    defaultValues: { logged_on: new Date().toISOString().slice(0, 10), mood_score: 7 },
    fields: [
      { name: "logged_on", label: "Ngày", type: "date", required: true, list: true },
      { name: "mood_score", label: "Điểm tâm trạng", type: "number", required: true, min: 1, max: 10, step: 1, list: true },
      { name: "gratitude_text", label: "Một điều biết ơn", type: "textarea", placeholder: "Điều nhỏ khiến hôm nay mềm hơn...", list: true, wide: true },
      { name: "journal_text", label: "Nhật ký tự quan sát", type: "textarea", wide: true }
    ]
  },
  spiritual_profiles: {
    table: "spiritual_profiles",
    titleField: "western_zodiac_label",
    subtitleField: "element_label",
    defaultValues: {},
    fields: [
      { name: "birth_date", label: "Ngày sinh", type: "date", required: true, list: true },
      { name: "western_zodiac_label", label: "Cung hoàng đạo", type: "text", required: true, list: true },
      { name: "lunar_year_label", label: "Năm âm lịch", type: "text", required: true, list: true },
      { name: "element_label", label: "Nạp âm / yếu tố", type: "text", required: true, list: true },
      { name: "clarity_score", label: "Điểm sáng rõ", type: "number", required: true, min: 1, max: 100, step: 1, list: true },
      { name: "energy_score", label: "Điểm năng lượng", type: "number", required: true, min: 1, max: 100, step: 1, list: true },
      { name: "ritual_text", label: "Nghi thức tự quan sát", type: "textarea", wide: true },
      { name: "feng_shui_focus_text", label: "Trọng tâm phong thủy", type: "textarea", wide: true },
      { name: "reflection_note", label: "Ghi chú phản chiếu", type: "textarea", wide: true }
    ]
  },
  strategy_profiles: {
    table: "strategy_profiles",
    titleField: "life_theme",
    subtitleField: "strongest_leverage",
    defaultValues: { focus_level_score: 70 },
    fields: [
      { name: "life_theme", label: "Chủ đề đời sống", type: "textarea", required: true, list: true, wide: true },
      { name: "strongest_leverage", label: "Đòn bẩy mạnh nhất", type: "textarea", required: true, list: true, wide: true },
      { name: "blind_spot", label: "Điểm mù", type: "textarea", list: true, wide: true },
      { name: "next_90_days_plan", label: "Kế hoạch 90 ngày", type: "textarea", list: true, wide: true },
      { name: "non_negotiables", label: "Điều không thương lượng", type: "lines", helper: "Mỗi dòng là một nguyên tắc.", list: true, wide: true },
      { name: "focus_level_score", label: "Điểm tập trung", type: "number", required: true, min: 1, max: 100, step: 1, list: true }
    ]
  },
  recurring_task_templates: {
    table: "recurring_task_templates",
    titleField: "title",
    subtitleField: "next_due_on",
    defaultValues: { category: "Công việc", priority: 3, cadence: "monthly", next_due_on: new Date().toISOString().slice(0, 10), is_active: true },
    fields: [
      { name: "title", label: "Tên việc lặp lại", type: "text", required: true, placeholder: "Làm bảng công, dọn bộ nhớ máy tính...", list: true, wide: true },
      { name: "cadence", label: "Chu kỳ", type: "select", required: true, options: recurringCadenceOptions, list: true },
      { name: "next_due_on", label: "Lần đến hạn kế tiếp", type: "date", required: true, list: true },
      { name: "category", label: "Nhóm", type: "text", required: true, placeholder: "Công việc, bảo trì, tài chính...", list: true },
      { name: "priority", label: "Ưu tiên", type: "number", required: true, min: 1, max: 5, step: 1, list: true },
      { name: "is_active", label: "Đang kích hoạt", type: "checkbox", list: true },
      { name: "notes", label: "Ghi chú", type: "textarea", placeholder: "Tiêu chí hoàn thành, checklist nhỏ...", wide: true }
    ]
  },
  energy_activity_types: {
    table: "energy_activity_types",
    titleField: "name",
    subtitleField: "category",
    defaultValues: { category: "practical_learning", sort_order: 10, is_active: true },
    fields: [
      { name: "name", label: "Tên nguồn năng lượng", type: "text", required: true, list: true, wide: true },
      { name: "category", label: "Nhóm nguồn", type: "select", required: true, options: energyCategoryOptions, list: true },
      { name: "description", label: "Mô tả", type: "textarea", wide: true },
      { name: "sort_order", label: "Thứ tự", type: "number", required: true, min: 1, step: 1 },
      { name: "is_active", label: "Đang dùng", type: "checkbox", list: true }
    ]
  }
} satisfies Record<string, TableSchema>;

export type EditableTable = keyof typeof tableSchemas;

export const editableTableNames = Object.keys(tableSchemas) as EditableTable[];
