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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          city: string
          created_at: string
          customer_code: string
          customer_name: string
          dealer_code: string
          email: string | null
          id: string
          invoice_number: string | null
          mobile_number: string
          registration_date: string
          tyre_details: string | null
          updated_at: string
          vehicle_make_model: string | null
          vehicle_number: string
        }
        Insert: {
          city: string
          created_at?: string
          customer_code: string
          customer_name: string
          dealer_code: string
          email?: string | null
          id?: string
          invoice_number?: string | null
          mobile_number: string
          registration_date?: string
          tyre_details?: string | null
          updated_at?: string
          vehicle_make_model?: string | null
          vehicle_number: string
        }
        Update: {
          city?: string
          created_at?: string
          customer_code?: string
          customer_name?: string
          dealer_code?: string
          email?: string | null
          id?: string
          invoice_number?: string | null
          mobile_number?: string
          registration_date?: string
          tyre_details?: string | null
          updated_at?: string
          vehicle_make_model?: string | null
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_dealer_code_fkey"
            columns: ["dealer_code"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_code"]
          },
        ]
      }
      dealers: {
        Row: {
          created_at: string
          dealer_address_line1: string | null
          dealer_address_line2: string | null
          dealer_channel_type: string | null
          dealer_city: string | null
          dealer_code: string
          dealer_email: string | null
          dealer_enrollment_date: string
          dealer_gstin: string | null
          dealer_mobile_number: string
          dealer_name: string
          dealer_pincode: string | null
          dealer_state: string | null
          dealer_status: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_address_line1?: string | null
          dealer_address_line2?: string | null
          dealer_channel_type?: string | null
          dealer_city?: string | null
          dealer_code: string
          dealer_email?: string | null
          dealer_enrollment_date?: string
          dealer_gstin?: string | null
          dealer_mobile_number: string
          dealer_name: string
          dealer_pincode?: string | null
          dealer_state?: string | null
          dealer_status?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_address_line1?: string | null
          dealer_address_line2?: string | null
          dealer_channel_type?: string | null
          dealer_city?: string | null
          dealer_code?: string
          dealer_email?: string | null
          dealer_enrollment_date?: string
          dealer_gstin?: string | null
          dealer_mobile_number?: string
          dealer_name?: string
          dealer_pincode?: string | null
          dealer_state?: string | null
          dealer_status?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          customer_code: string
          dealer_code: string
          id: string
          referral_source: string
          referral_timestamp: string
        }
        Insert: {
          customer_code: string
          dealer_code: string
          id?: string
          referral_source?: string
          referral_timestamp?: string
        }
        Update: {
          customer_code?: string
          dealer_code?: string
          id?: string
          referral_source?: string
          referral_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_customer_code_fkey"
            columns: ["customer_code"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_code"]
          },
          {
            foreignKeyName: "referrals_dealer_code_fkey"
            columns: ["dealer_code"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_code"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          customer_code: string
          customer_mobile: string | null
          customer_name: string
          dealer_code: string
          id: string
          order_id: string
          order_timestamp: string
          payment_status: string
          payment_transaction_id: string | null
          plan_id: string
          plan_name: string
          plan_price: number
          subscription_end_date: string
          subscription_start_date: string
        }
        Insert: {
          created_at?: string
          customer_code: string
          customer_mobile?: string | null
          customer_name: string
          dealer_code: string
          id?: string
          order_id: string
          order_timestamp?: string
          payment_status?: string
          payment_transaction_id?: string | null
          plan_id: string
          plan_name: string
          plan_price: number
          subscription_end_date: string
          subscription_start_date?: string
        }
        Update: {
          created_at?: string
          customer_code?: string
          customer_mobile?: string | null
          customer_name?: string
          dealer_code?: string
          id?: string
          order_id?: string
          order_timestamp?: string
          payment_status?: string
          payment_transaction_id?: string | null
          plan_id?: string
          plan_name?: string
          plan_price?: number
          subscription_end_date?: string
          subscription_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_code_fkey"
            columns: ["customer_code"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_code"]
          },
          {
            foreignKeyName: "subscriptions_dealer_code_fkey"
            columns: ["dealer_code"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
