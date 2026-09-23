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
  public: {
    Tables: {
      admin_notes: {
        Row: {
          body: string | null
          created_at: string
          id: string
          resolved: boolean
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          resolved?: boolean
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          resolved?: boolean
          title?: string
        }
        Relationships: []
      }
      payment_rules: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          debit_pct: number
          discount_installments_max: number
          discount_installments_pct: number
          max_installments: number
          pix_pct: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          debit_pct?: number
          discount_installments_max?: number
          discount_installments_pct?: number
          max_installments: number
          pix_pct?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          debit_pct?: number
          discount_installments_max?: number
          discount_installments_pct?: number
          max_installments?: number
          pix_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          aroma_profile: string | null
          availability: Database["public"]["Enums"]["product_availability"]
          base_price_cents: number
          battery_mah: number | null
          brand: string | null
          category: Database["public"]["Enums"]["product_category"]
          color: string | null
          condition: string | null
          created_at: string
          description: string | null
          featured: boolean
          gender: Database["public"]["Enums"]["product_gender"] | null
          id: string
          name: string
          published: boolean
          ram_gb: number | null
          search_aliases: string[]
          seed_key: string
          short_description: string | null
          slug: string
          sort_order: number
          storage_gb: number | null
          updated_at: string
          volume_ml: number | null
          warranty_text: string | null
        }
        Insert: {
          aroma_profile?: string | null
          availability?: Database["public"]["Enums"]["product_availability"]
          base_price_cents: number
          battery_mah?: number | null
          brand?: string | null
          category: Database["public"]["Enums"]["product_category"]
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          name: string
          published?: boolean
          ram_gb?: number | null
          search_aliases?: string[]
          seed_key: string
          short_description?: string | null
          slug: string
          sort_order?: number
          storage_gb?: number | null
          updated_at?: string
          volume_ml?: number | null
          warranty_text?: string | null
        }
        Update: {
          aroma_profile?: string | null
          availability?: Database["public"]["Enums"]["product_availability"]
          base_price_cents?: number
          battery_mah?: number | null
          brand?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          name?: string
          published?: boolean
          ram_gb?: number | null
          search_aliases?: string[]
          seed_key?: string
          short_description?: string | null
          slug?: string
          sort_order?: number
          storage_gb?: number | null
          updated_at?: string
          volume_ml?: number | null
          warranty_text?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address_line: string | null
          city: string | null
          delivery_note: string | null
          hero_description: string | null
          hero_desktop_url: string | null
          hero_mobile_url: string | null
          hero_overline: string | null
          hero_title: string | null
          hours_saturday: string | null
          hours_sunday: string | null
          hours_weekdays: string | null
          instagram_handle: string | null
          instagram_url: string | null
          key: string
          logo_url: string | null
          state: string | null
          store_name: string
          store_photo_url: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          delivery_note?: string | null
          hero_description?: string | null
          hero_desktop_url?: string | null
          hero_mobile_url?: string | null
          hero_overline?: string | null
          hero_title?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          instagram_handle?: string | null
          instagram_url?: string | null
          key: string
          logo_url?: string | null
          state?: string | null
          store_name: string
          store_photo_url?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          delivery_note?: string | null
          hero_description?: string | null
          hero_desktop_url?: string | null
          hero_mobile_url?: string | null
          hero_overline?: string | null
          hero_title?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          instagram_handle?: string | null
          instagram_url?: string | null
          key?: string
          logo_url?: string | null
          state?: string | null
          store_name?: string
          store_photo_url?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      product_availability: "available" | "sold_out"
      product_category: "perfumes" | "celulares"
      product_gender: "masculino" | "feminino" | "unissex"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      product_availability: ["available", "sold_out"],
      product_category: ["perfumes", "celulares"],
      product_gender: ["masculino", "feminino", "unissex"],
    },
  },
} as const
