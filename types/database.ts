export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      aliases: {
        Row: {
          alias_code: string
          cycle_id: string
          id: string
          user_id: string
        }
        Insert: {
          alias_code: string
          cycle_id: string
          id?: string
          user_id: string
        }
        Update: {
          alias_code?: string
          cycle_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aliases_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aliases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          id: string
          question_id: string
          submission_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          id?: string
          question_id: string
          submission_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          submission_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "my_assignments_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "officer_results_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "officer_results_visible"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submission_scores"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_cycles: {
        Row: {
          closes_at: string
          id: string
          is_active: boolean
          name: string
          opens_at: string
        }
        Insert: {
          closes_at: string
          id?: string
          is_active?: boolean
          name: string
          opens_at: string
        }
        Update: {
          closes_at?: string
          id?: string
          is_active?: boolean
          name?: string
          opens_at?: string
        }
        Relationships: []
      }
      form_assignments: {
        Row: {
          cycle_id: string
          evaluatee_id: string
          evaluator_id: string
          form_id: string
          id: string
        }
        Insert: {
          cycle_id: string
          evaluatee_id: string
          evaluator_id: string
          form_id: string
          id?: string
        }
        Update: {
          cycle_id?: string
          evaluatee_id?: string
          evaluator_id?: string
          form_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_evaluatee_id_fkey"
            columns: ["evaluatee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          form_id: string
          id: string
          is_required: boolean
          kind: string
          options: Json | null
          order_index: number
          prompt: string
        }
        Insert: {
          form_id: string
          id?: string
          is_required?: boolean
          kind: string
          options?: Json | null
          order_index: number
          prompt: string
        }
        Update: {
          form_id?: string
          id?: string
          is_required?: boolean
          kind?: string
          options?: Json | null
          order_index?: number
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          code: string
          description: string | null
          evaluatee_role: Database["public"]["Enums"]["app_role"]
          evaluator_role: Database["public"]["Enums"]["app_role"]
          id: string
          is_active: boolean
          rating_scale_key: string | null
          results_visible_to_evaluatee: boolean
          title: string
        }
        Insert: {
          code: string
          description?: string | null
          evaluatee_role: Database["public"]["Enums"]["app_role"]
          evaluator_role: Database["public"]["Enums"]["app_role"]
          id?: string
          is_active?: boolean
          rating_scale_key?: string | null
          results_visible_to_evaluatee?: boolean
          title: string
        }
        Update: {
          code?: string
          description?: string | null
          evaluatee_role?: Database["public"]["Enums"]["app_role"]
          evaluator_role?: Database["public"]["Enums"]["app_role"]
          id?: string
          is_active?: boolean
          rating_scale_key?: string | null
          results_visible_to_evaluatee?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_rating_scale_key_fkey"
            columns: ["rating_scale_key"]
            isOneToOne: false
            referencedRelation: "rating_scales"
            referencedColumns: ["key"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          roster_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          roster_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          roster_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["id"]
          },
        ]
      }
      rating_scale_options: {
        Row: {
          display_order: number
          option_key: string
          scale_key: string
          weight_percent: number
        }
        Insert: {
          display_order: number
          option_key: string
          scale_key: string
          weight_percent: number
        }
        Update: {
          display_order?: number
          option_key?: string
          scale_key?: string
          weight_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "rating_scale_options_scale_key_fkey"
            columns: ["scale_key"]
            isOneToOne: false
            referencedRelation: "rating_scales"
            referencedColumns: ["key"]
          },
        ]
      }
      rating_scales: {
        Row: {
          key: string
          label: string
        }
        Insert: {
          key: string
          label: string
        }
        Update: {
          key?: string
          label?: string
        }
        Relationships: []
      }
      roster: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string
          id: string
          status: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          id?: string
          status?: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          id?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "form_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "my_assignments_view"
            referencedColumns: ["assignment_id"]
          },
        ]
      }
    }
    Views: {
      my_assignments_view: {
        Row: {
          assignment_id: string | null
          cycle_id: string | null
          evaluatee_name: string | null
          evaluatee_role: Database["public"]["Enums"]["app_role"] | null
          form_code: string | null
          form_description: string | null
          form_id: string | null
          form_title: string | null
          rating_scale_key: string | null
          submission_id: string | null
          submission_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_rating_scale_key_fkey"
            columns: ["rating_scale_key"]
            isOneToOne: false
            referencedRelation: "rating_scales"
            referencedColumns: ["key"]
          },
        ]
      }
      officer_results_view: {
        Row: {
          cycle_id: string | null
          evaluatee_id: string | null
          evaluator_alias: string | null
          form_id: string | null
          submission_id: string | null
          submitted_at: string | null
          total_sum: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_evaluatee_id_fkey"
            columns: ["evaluatee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_results_visible: {
        Row: {
          cycle_id: string | null
          evaluatee_id: string | null
          evaluator_alias: string | null
          form_id: string | null
          submission_id: string | null
          submitted_at: string | null
          total_sum: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "evaluation_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_evaluatee_id_fkey"
            columns: ["evaluatee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_scores: {
        Row: {
          submission_id: string | null
          total_sum: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      refresh_submission_scores: { Args: never; Returns: undefined }
      regenerate_aliases: { Args: { target_cycle: string }; Returns: number }
      set_active_cycle: {
        Args: { make_active: boolean; target_cycle: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "encrypt" | "officer" | "executive" | "president" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["encrypt", "officer", "executive", "president", "admin"],
    },
  },
} as const
