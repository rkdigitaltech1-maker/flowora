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
      // ── Affiliate Module Tables ──
      affiliates: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          affiliate_code: string;
          referral_link: string;
          status: "pending" | "approved" | "active" | "suspended" | "rejected";
          approved_at: string | null;
          approved_by: string | null;
          rejection_reason: string | null;
          payment_method: "upi" | "paypal" | "bank_transfer" | null;
          payment_details: Json;
          agreement_accepted: boolean;
          agreement_accepted_at: string | null;
          agreement_version: string;
          agreement_ip: string | null;
          promotion_channels: string[];
          website_url: string | null;
          social_handles: Json;
          commission_rate: number;
          commission_duration_months: number;
          total_referrals: number;
          total_conversions: number;
          total_earnings: number;
          total_paid: number;
          pending_balance: number;
          notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliates"]["Row"], "id" | "referral_link" | "created_at" | "updated_at" | "total_referrals" | "total_conversions" | "total_earnings" | "total_paid" | "pending_balance">;
        Update: Partial<Database["public"]["Tables"]["affiliates"]["Insert"]>;
      };
      affiliate_referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          referred_user_id: string | null;
          referred_email: string | null;
          referred_name: string | null;
          referral_code: string;
          source: string | null;
          medium: string | null;
          campaign: string | null;
          landing_page: string | null;
          ip_address: string | null;
          user_agent: string | null;
          status: "clicked" | "signed_up" | "converted" | "expired" | "refunded";
          clicked_at: string;
          signed_up_at: string | null;
          converted_at: string | null;
          tracking_cookie: string | null;
          cookie_expires_at: string | null;
          attribution_window_days: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_referrals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_referrals"]["Insert"]>;
      };
      affiliate_commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          referral_id: string;
          order_id: string | null;
          subscription_id: string | null;
          sale_amount: number;
          commission_rate: number;
          commission_amount: number;
          currency: string;
          month_number: number;
          is_recurring: boolean;
          recurring_start_date: string | null;
          recurring_end_date: string | null;
          status: "pending" | "approved" | "paid" | "cancelled" | "refunded";
          approved_at: string | null;
          paid_at: string | null;
          payout_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_commissions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_commissions"]["Insert"]>;
      };
      affiliate_payouts: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          currency: string;
          payment_method: string;
          payment_details: Json;
          status: "pending" | "processing" | "completed" | "failed" | "cancelled";
          transaction_id: string | null;
          processed_at: string | null;
          processed_by: string | null;
          failure_reason: string | null;
          period_start: string | null;
          period_end: string | null;
          invoice_number: string | null;
          invoice_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_payouts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_payouts"]["Insert"]>;
      };
      affiliate_clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          referral_code: string;
          ip_address: string | null;
          user_agent: string | null;
          referer: string | null;
          landing_page: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          device_type: string | null;
          browser: string | null;
          country: string | null;
          city: string | null;
          is_unique: boolean;
          session_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_clicks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_clicks"]["Insert"]>;
      };
      affiliate_settings: {
        Row: {
          id: string;
          program_name: string;
          program_active: boolean;
          default_commission_rate: number;
          commission_duration_months: number;
          minimum_payout_amount: number;
          payout_frequency: string;
          cookie_duration_days: number;
          auto_approve_affiliates: boolean;
          require_agreement: boolean;
          agreement_text: string | null;
          agreement_version: string;
          program_description: string | null;
          promotional_materials: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_settings"]["Insert"]>;
      };
      affiliate_notifications: {
        Row: {
          id: string;
          affiliate_id: string;
          type: string;
          title: string;
          message: string;
          data: Json;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["affiliate_notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["affiliate_notifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
