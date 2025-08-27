export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      engagement_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          body: string
          clicked_at: string | null
          delivered_at: string | null
          id: string
          metadata: Json | null
          segment_id: string | null
          sent_at: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          segment_id?: string | null
          sent_at?: string
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          segment_id?: string | null
          sent_at?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "user_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_orders: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_country: string | null
          address_neighborhood: string | null
          address_state: string | null
          address_street: string | null
          address_street_number: string | null
          address_zip_code: string | null
          amount: number
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          pix_code: string | null
          product_name: string
          quantity: number
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_state?: string | null
          address_street?: string | null
          address_street_number?: string | null
          address_zip_code?: string | null
          amount: number
          created_at?: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          pix_code?: string | null
          product_name: string
          quantity?: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_state?: string | null
          address_street?: string | null
          address_street_number?: string | null
          address_zip_code?: string | null
          amount?: number
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          pix_code?: string | null
          product_name?: string
          quantity?: number
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscription_leads: {
        Row: {
          auth_key: string
          created_at: string
          customer_address_city: string | null
          customer_address_complement: string | null
          customer_address_country: string | null
          customer_address_neighborhood: string | null
          customer_address_number: string | null
          customer_address_state: string | null
          customer_address_street: string | null
          customer_address_zip_code: string | null
          customer_cpf: string | null
          customer_name: string | null
          customer_phone: string | null
          endpoint: string
          has_made_purchase: boolean | null
          id: string
          interested_product: string | null
          ip_address: unknown | null
          is_active: boolean
          last_notification_sent: string | null
          last_purchase_date: string | null
          lead_quality_score: number | null
          lead_source: string | null
          p256dh_key: string
          purchase_amount: number | null
          referrer: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          customer_address_city?: string | null
          customer_address_complement?: string | null
          customer_address_country?: string | null
          customer_address_neighborhood?: string | null
          customer_address_number?: string | null
          customer_address_state?: string | null
          customer_address_street?: string | null
          customer_address_zip_code?: string | null
          customer_cpf?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          endpoint: string
          has_made_purchase?: boolean | null
          id?: string
          interested_product?: string | null
          ip_address?: unknown | null
          is_active?: boolean
          last_notification_sent?: string | null
          last_purchase_date?: string | null
          lead_quality_score?: number | null
          lead_source?: string | null
          p256dh_key: string
          purchase_amount?: number | null
          referrer?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          customer_address_city?: string | null
          customer_address_complement?: string | null
          customer_address_country?: string | null
          customer_address_neighborhood?: string | null
          customer_address_number?: string | null
          customer_address_state?: string | null
          customer_address_street?: string | null
          customer_address_zip_code?: string | null
          customer_cpf?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          endpoint?: string
          has_made_purchase?: boolean | null
          id?: string
          interested_product?: string | null
          ip_address?: unknown | null
          is_active?: boolean
          last_notification_sent?: string | null
          last_purchase_date?: string | null
          lead_quality_score?: number | null
          lead_source?: string | null
          p256dh_key?: string
          purchase_amount?: number | null
          referrer?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      remarketing_campaigns: {
        Row: {
          badge: string | null
          body: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          schedule_type: string
          scheduled_for: string | null
          sent_at: string | null
          target_audience: Json | null
          title: string
          total_clicked: number | null
          total_delivered: number | null
          total_sent: number | null
        }
        Insert: {
          badge?: string | null
          body: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          schedule_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          target_audience?: Json | null
          title: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_sent?: number | null
        }
        Update: {
          badge?: string | null
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          schedule_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          target_audience?: Json | null
          title?: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_sent?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          frequency: string | null
          id: string
          notification_types: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string | null
          id?: string
          notification_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string | null
          id?: string
          notification_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_segment_memberships: {
        Row: {
          created_at: string
          id: string
          segment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          segment_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          segment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_segment_memberships_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "user_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_quality_score: {
        Args: {
          lead_record: Database["public"]["Tables"]["push_subscription_leads"]["Row"]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
