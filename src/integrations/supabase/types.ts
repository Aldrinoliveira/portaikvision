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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      arquivos: {
        Row: {
          categoria_arquivo: string
          created_at: string
          descricao: string | null
          downloads: number
          id: string
          link_url: string
          listado: boolean
          nome_arquivo: string
          produto_id: string
        }
        Insert: {
          categoria_arquivo: string
          created_at?: string
          descricao?: string | null
          downloads?: number
          id?: string
          link_url: string
          listado?: boolean
          nome_arquivo: string
          produto_id: string
        }
        Update: {
          categoria_arquivo?: string
          created_at?: string
          descricao?: string | null
          downloads?: number
          id?: string
          link_url?: string
          listado?: boolean
          nome_arquivo?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string
          link_redirecionamento: string | null
          tamanho: string | null
          titulo: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url: string
          link_redirecionamento?: string | null
          tamanho?: string | null
          titulo?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string
          link_redirecionamento?: string | null
          tamanho?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      numeros_serie: {
        Row: {
          created_at: string
          id: string
          numero_serie: string
          produto_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          numero_serie: string
          produto_id: string
        }
        Update: {
          created_at?: string
          id?: string
          numero_serie?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "numeros_serie_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          partnumber: string
          subcategoria_id: string | null
        }
        Insert: {
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          partnumber: string
          subcategoria_id?: string | null
        }
        Update: {
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          partnumber?: string
          subcategoria_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          banner_desc_color: string | null
          banner_desc_size: string | null
          banner_title_color: string | null
          banner_title_size: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          banner_desc_color?: string | null
          banner_desc_size?: string | null
          banner_title_color?: string | null
          banner_title_size?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          banner_desc_color?: string | null
          banner_desc_size?: string | null
          banner_title_color?: string | null
          banner_title_size?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      solicitacoes_firmware: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          numero_serie: string | null
          produto_nome: string | null
          status: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          numero_serie?: string | null
          produto_nome?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          numero_serie?: string | null
          produto_nome?: string | null
          status?: string
        }
        Relationships: []
      }
      subcategorias: {
        Row: {
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
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
      vw_top_downloads: {
        Row: {
          produto_id: string | null
          total_downloads: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_downloads: {
        Args: { _arquivo_id: string }
        Returns: {
          link_url: string
          downloads: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
