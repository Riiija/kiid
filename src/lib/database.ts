export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          family_id: string | null
          full_name: string
          first_name: string | null
          role: 'parent' | 'child'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          family_id?: string | null
          full_name: string
          first_name?: string | null
          role: 'parent' | 'child'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          full_name?: string
          first_name?: string | null
          role?: 'parent' | 'child'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      child_accounts: {
        Row: {
          id: string
          profile_id: string
          balance: number
          qr_token: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          balance?: number
          qr_token?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          balance?: number
          qr_token?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          child_account_id: string
          amount: number
          transaction_type: 'credit' | 'debit' | 'reward' | 'adjustment' | 'saving'
          description: string
          balance_before: number
          balance_after: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          child_account_id: string
          amount: number
          transaction_type: 'credit' | 'debit' | 'reward' | 'adjustment' | 'saving'
          description: string
          balance_before: number
          balance_after: number
          created_by: string
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      rewards: {
        Row: {
          id: string
          family_id: string
          name: string
          description: string | null
          cost: number
          icon: string | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          description?: string | null
          cost: number
          icon?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          description?: string | null
          cost?: number
          icon?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          id: string
          reward_id: string
          child_account_id: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          comment: string | null
        }
        Insert: {
          id?: string
          reward_id: string
          child_account_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          comment?: string | null
        }
        Update: {
          id?: string
          reward_id?: string
          child_account_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          comment?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          id: string
          child_account_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          child_account_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          child_account_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_child_transaction: {
        Args: {
          p_child_account_id: string
          p_amount: number
          p_transaction_type: string
          p_description: string
        }
        Returns: Database['public']['Tables']['transactions']['Row']
      }
      find_child_by_qr_token: {
        Args: {
          p_qr_token: string
        }
        Returns: {
          child_account_id: string
          profile_id: string
          first_name: string | null
          full_name: string
          avatar_url: string | null
          balance: number
        }[]
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
