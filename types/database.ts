// PLACEHOLDER — regenerate with:  npm run db:types
// (`supabase gen types typescript --local > types/database.ts`)
//
// The project convention (CLAUDE.md §Conventions) is that this file is GENERATED,
// never hand-maintained. It is stubbed here only so the app type-checks before a
// local Supabase stack (Docker) is available. Once `supabase start` works, run
// the command above and commit the real output, replacing everything below.
//
// The shape (Tables/Views/Functions/Enums, each table with a Relationships array)
// matches what `@supabase/supabase-js` expects for full type inference.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | "encrypt"
  | "officer"
  | "executive"
  | "president"
  | "admin";

type QuestionKind = "likert" | "scale" | "text" | "choice";
type SubmissionStatus = "draft" | "submitted";

export interface Database {
  public: {
    Tables: {
      roster: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: AppRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: AppRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: AppRole;
          is_active?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          roster_id: string;
          email: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id: string;
          roster_id: string;
          email: string;
          role: AppRole;
          created_at?: string;
        };
        Update: {
          roster_id?: string;
          email?: string;
          role?: AppRole;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_roster_id_fkey";
            columns: ["roster_id"];
            referencedRelation: "roster";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluation_cycles: {
        Row: {
          id: string;
          name: string;
          opens_at: string;
          closes_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          opens_at: string;
          closes_at: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          opens_at?: string;
          closes_at?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      aliases: {
        Row: {
          id: string;
          cycle_id: string;
          user_id: string;
          alias_code: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          user_id: string;
          alias_code: string;
        };
        Update: {
          alias_code?: string;
        };
        Relationships: [];
      };
      forms: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          evaluator_role: AppRole;
          evaluatee_role: AppRole;
          results_visible_to_evaluatee: boolean;
          is_active: boolean;
          rating_scale_key: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          evaluator_role: AppRole;
          evaluatee_role: AppRole;
          results_visible_to_evaluatee?: boolean;
          is_active?: boolean;
          rating_scale_key?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          results_visible_to_evaluatee?: boolean;
          is_active?: boolean;
          rating_scale_key?: string | null;
        };
        Relationships: [];
      };
      form_questions: {
        Row: {
          id: string;
          form_id: string;
          order_index: number;
          prompt: string;
          kind: QuestionKind;
          options: Json | null;
          is_required: boolean;
        };
        Insert: {
          id?: string;
          form_id: string;
          order_index: number;
          prompt: string;
          kind: QuestionKind;
          options?: Json | null;
          is_required?: boolean;
        };
        Update: {
          order_index?: number;
          prompt?: string;
          kind?: QuestionKind;
          options?: Json | null;
          is_required?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey";
            columns: ["form_id"];
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
        ];
      };
      form_assignments: {
        Row: {
          id: string;
          cycle_id: string;
          form_id: string;
          // SELECT on this column is revoked from `authenticated` (0011); only
          // the service-role (admin) client may read it.
          evaluator_id: string;
          evaluatee_id: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          form_id: string;
          evaluator_id: string;
          evaluatee_id: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "form_assignments_evaluator_id_fkey";
            columns: ["evaluator_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "form_assignments_evaluatee_id_fkey";
            columns: ["evaluatee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          submitted_at: string;
          status: SubmissionStatus;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          submitted_at?: string;
          status?: SubmissionStatus;
        };
        Update: {
          status?: SubmissionStatus;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            referencedRelation: "form_assignments";
            referencedColumns: ["id"];
          },
        ];
      };
      answers: {
        Row: {
          id: string;
          submission_id: string;
          question_id: string;
          value_numeric: number | null;
          value_text: string | null;
        };
        Insert: {
          id?: string;
          submission_id: string;
          question_id: string;
          value_numeric?: number | null;
          value_text?: string | null;
        };
        Update: {
          value_numeric?: number | null;
          value_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "answers_submission_id_fkey";
            columns: ["submission_id"];
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "form_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      rating_scales: {
        Row: { key: string; label: string };
        Insert: { key: string; label: string };
        Update: { label?: string };
        Relationships: [];
      };
      rating_scale_options: {
        Row: {
          scale_key: string;
          option_key: string;
          weight_percent: number;
          display_order: number;
        };
        Insert: {
          scale_key: string;
          option_key: string;
          weight_percent: number;
          display_order: number;
        };
        Update: {
          weight_percent?: number;
          display_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "rating_scale_options_scale_key_fkey";
            columns: ["scale_key"];
            referencedRelation: "rating_scales";
            referencedColumns: ["key"];
          },
        ];
      };
    };
    Views: {
      submission_scores: {
        Row: {
          submission_id: string | null;
          total_sum: number | null;
        };
        Relationships: [];
      };
      my_assignments_view: {
        Row: {
          assignment_id: string | null;
          cycle_id: string | null;
          form_id: string | null;
          form_code: string | null;
          form_title: string | null;
          form_description: string | null;
          rating_scale_key: string | null;
          evaluatee_name: string | null;
          evaluatee_role: AppRole | null;
          submission_id: string | null;
          submission_status: SubmissionStatus | null;
        };
        Relationships: [];
      };
      officer_results_view: {
        Row: {
          submission_id: string | null;
          evaluatee_id: string | null;
          form_id: string | null;
          cycle_id: string | null;
          evaluator_alias: string | null;
          total_sum: number | null;
          submitted_at: string | null;
        };
        Relationships: [];
      };
      officer_results_visible: {
        Row: {
          submission_id: string | null;
          evaluatee_id: string | null;
          form_id: string | null;
          cycle_id: string | null;
          evaluator_alias: string | null;
          total_sum: number | null;
          submitted_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_app_role: {
        Args: Record<PropertyKey, never>;
        Returns: AppRole;
      };
      refresh_submission_scores: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      regenerate_aliases: {
        Args: { target_cycle: string };
        Returns: number;
      };
      set_active_cycle: {
        Args: { target_cycle: string; make_active: boolean };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<never, never>;
  };
}
