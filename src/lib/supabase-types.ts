// Supabase Database type definitions
// These mirror the SQL schema in supabase/schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          plan: string;
          account_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      creator_workspaces: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          plan: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_workspaces"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["creator_workspaces"]["Insert"]>;
      };
      instagram_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          instagram_user_id: string;
          username: string;
          status: string;
          connected_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["instagram_accounts"]["Row"], "id" | "connected_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["instagram_accounts"]["Insert"]>;
      };
      creator_campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          instagram_account_id: string | null;
          name: string;
          status: string;
          trigger_type: string;
          keywords: string[];
          send_once_per_user: boolean;
          delay_seconds: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_campaigns"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["creator_campaigns"]["Insert"]>;
      };
      creator_leads: {
        Row: {
          id: string;
          workspace_id: string;
          campaign_id: string | null;
          instagram_username: string | null;
          name: string | null;
          email: string | null;
          phone: string | null;
          source: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_leads"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["creator_leads"]["Insert"]>;
      };
      message_deliveries: {
        Row: {
          id: string;
          workspace_id: string;
          campaign_id: string;
          recipient_instagram_id: string;
          recipient_username: string;
          message_text: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["message_deliveries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["message_deliveries"]["Insert"]>;
      };
      creator_products: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          type: string;
          price: number;
          sales_count: number;
          revenue: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["creator_products"]["Insert"]>;
      };
      creator_orders: {
        Row: {
          id: string;
          workspace_id: string;
          product_id: string;
          amount: number;
          currency: string;
          status: string;
          customer_name: string | null;
          customer_email: string | null;
          order_number: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["creator_orders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["creator_orders"]["Insert"]>;
      };
      automation_events: {
        Row: {
          id: string;
          workspace_id: string | null;
          campaign_id: string | null;
          event_type: string;
          actor_username: string | null;
          payload_json: string;
          status: string;
          created_at: string;
          processed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["automation_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["automation_events"]["Insert"]>;
      };
      workflows: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: string;
          trigger_type: string;
          last_run_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workflows"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["workflows"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
