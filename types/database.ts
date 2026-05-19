export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TaskStatus = "todo" | "doing" | "done";
export type FinanceType = "income" | "expense" | "saving";
export type RecurringTaskCadence = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type EnergyCategory =
  | "emotional_release"
  | "body_rhythm"
  | "imagination_flow"
  | "deep_work_calm"
  | "skill_drilling"
  | "practical_learning";
export type TradingMarket = "crypto" | "us_stock" | "vn_stock" | "forex" | "futures" | "other";
export type TradingBias = "bullish" | "bearish" | "neutral";
export type TradingIdeaStatus = "researching" | "ready" | "testing" | "archived";
export type TradingBacktestVerdict = "promising" | "observe" | "reject";
export type ProjectAccountStatus = "active" | "paused" | "archived";
export type GiupCyQuestionType = "single_choice" | "true_false" | "short_answer";

type BaseRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = BaseRow & {
  email: string | null;
  full_name: string | null;
  birth_date: string | null;
  western_zodiac_label: string | null;
  lunar_year_label: string | null;
  element_label: string | null;
  preferred_theme: string;
};

export type TaskRow = BaseRow & {
  title: string;
  status: TaskStatus;
  category: string;
  priority: number;
  due_on: string | null;
  notes: string | null;
  source_recurring_task_id: string | null;
  recurrence_due_on: string | null;
};

export type DailyPriorityRow = BaseRow & {
  title: string;
  rank: number;
  completed: boolean;
  planned_on: string;
  source_task_id: string | null;
};

export type FinanceEntryRow = BaseRow & {
  type: FinanceType;
  category: string;
  amount: number;
  occurred_on: string;
  notes: string | null;
};

export type HealthLogRow = BaseRow & {
  logged_on: string;
  sleep_hours: number;
  water_liters: number;
  steps: number;
  workouts_count: number;
  energy_score: number;
  notes: string | null;
};

export type StudySessionRow = BaseRow & {
  topic: string;
  duration_minutes: number;
  occurred_on: string;
  weekly_target_minutes: number;
  notes: string | null;
};

export type TimeLogRow = BaseRow & {
  logged_on: string;
  deep_work_minutes: number;
  screen_time_minutes: number;
  top_priorities: string[];
  planning_notes: string | null;
};

export type RelationshipLogRow = BaseRow & {
  person_name: string;
  action_taken: string;
  completed: boolean;
  occurred_on: string;
  notes: string | null;
};

export type EmotionLogRow = BaseRow & {
  logged_on: string;
  mood_score: number;
  gratitude_text: string | null;
  journal_text: string | null;
};

export type SpiritualProfileRow = BaseRow & {
  birth_date: string;
  western_zodiac_label: string;
  lunar_year_label: string;
  element_label: string;
  clarity_score: number;
  energy_score: number;
  ritual_text: string | null;
  feng_shui_focus_text: string | null;
  reflection_note: string | null;
};

export type StrategyProfileRow = BaseRow & {
  life_theme: string | null;
  strongest_leverage: string | null;
  blind_spot: string | null;
  next_90_days_plan: string | null;
  non_negotiables: string[];
  focus_level_score: number;
};

export type EnergyActivityTypeRow = BaseRow & {
  name: string;
  category: EnergyCategory;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type EnergyActivityLogRow = BaseRow & {
  activity_type_id: string;
  logged_on: string;
  completed: boolean;
  duration_minutes: number | null;
  notes: string | null;
};

export type QuickNoteRow = BaseRow & {
  title: string;
  body: string;
  color: "cyan" | "indigo" | "rose" | "gold";
  is_pinned: boolean;
  completed: boolean;
  sort_order: number;
};

export type RecurringTaskTemplateRow = BaseRow & {
  title: string;
  category: string;
  priority: number;
  cadence: RecurringTaskCadence;
  next_due_on: string;
  notes: string | null;
  is_active: boolean;
};

export type TradingWatchlistRow = BaseRow & {
  symbol: string;
  market: TradingMarket;
  thesis: string | null;
  bias: TradingBias;
  alert_price: number | null;
  is_active: boolean;
};

export type TradingIdeaRow = BaseRow & {
  title: string;
  prompt: string;
  symbol: string | null;
  market: TradingMarket;
  timeframe: string;
  status: TradingIdeaStatus;
  thesis: string | null;
  risk_notes: string | null;
};

export type TradingBacktestRow = BaseRow & {
  idea_id: string | null;
  title: string;
  symbol: string | null;
  timeframe: string;
  period_label: string;
  total_return: number;
  max_drawdown: number;
  sharpe: number;
  win_rate: number;
  trade_count: number;
  verdict: TradingBacktestVerdict;
  notes: string | null;
};

export type ProjectAccountRow = BaseRow & {
  project_name: string;
  project_status: ProjectAccountStatus;
  project_type: string | null;
  supabase_project_name: string | null;
  supabase_project_ref: string | null;
  supabase_url: string | null;
  vercel_project_name: string | null;
  vercel_url: string | null;
  github_repo_url: string | null;
  domain_names: string[];
  phone_number: string | null;
  owner_email: string | null;
  login_email: string | null;
  billing_plan: string | null;
  last_checked_on: string | null;
  environment_notes: string | null;
  access_notes: string | null;
  notes: string | null;
};

export type GiupCyExamRow = BaseRow & {
  title: string;
  description: string | null;
  subject: string;
  duration_minutes: number;
  slug: string;
  source_file_name: string | null;
  is_active: boolean;
};

export type GiupCyExamQuestionRow = {
  id: string;
  exam_id: string;
  section: string;
  question_number: number;
  question_type: GiupCyQuestionType;
  prompt: string;
  options: Json;
  correct_answer: Json;
  points: number;
  explanation: string | null;
  needs_review: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GiupCyExamAttemptRow = {
  id: string;
  exam_id: string;
  student_name: string;
  answers: Json;
  graded_details: Json;
  score: number;
  max_score: number;
  correct_count: number;
  graded_count: number;
  total_count: number;
  started_at: string;
  submitted_at: string;
  created_at: string;
};

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDefinition<ProfileRow>;
      tasks: TableDefinition<TaskRow>;
      daily_priorities: TableDefinition<DailyPriorityRow>;
      finance_entries: TableDefinition<FinanceEntryRow>;
      health_logs: TableDefinition<HealthLogRow>;
      study_sessions: TableDefinition<StudySessionRow>;
      time_logs: TableDefinition<TimeLogRow>;
      relationship_logs: TableDefinition<RelationshipLogRow>;
      emotion_logs: TableDefinition<EmotionLogRow>;
      spiritual_profiles: TableDefinition<SpiritualProfileRow>;
      strategy_profiles: TableDefinition<StrategyProfileRow>;
      recurring_task_templates: TableDefinition<RecurringTaskTemplateRow>;
      quick_notes: TableDefinition<QuickNoteRow>;
      energy_activity_types: TableDefinition<EnergyActivityTypeRow>;
      energy_activity_logs: TableDefinition<EnergyActivityLogRow>;
      trading_watchlist: TableDefinition<TradingWatchlistRow>;
      trading_ideas: TableDefinition<TradingIdeaRow>;
      trading_backtests: TableDefinition<TradingBacktestRow>;
      project_accounts: TableDefinition<ProjectAccountRow>;
      giup_cy_exams: TableDefinition<GiupCyExamRow>;
      giup_cy_exam_questions: TableDefinition<GiupCyExamQuestionRow>;
      giup_cy_exam_attempts: TableDefinition<GiupCyExamAttemptRow>;
    };
    Views: Record<string, never>;
    Functions: {
      giup_cy_owner_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
