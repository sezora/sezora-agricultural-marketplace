import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          age: number | null
          bio: string | null
          user_type: 'student' | 'employer'
          company_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          age?: number | null
          bio?: string | null
          user_type: 'student' | 'employer'
          company_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          age?: number | null
          bio?: string | null
          user_type?: 'student' | 'employer'
          company_name?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company_name: string
          location: string
          description: string
          pay: string
          employer_id: string
          status: 'pending' | 'approved'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company_name: string
          location: string
          description: string
          pay: string
          employer_id: string
          status?: 'pending' | 'approved'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_name?: string
          location?: string
          description?: string
          pay?: string
          employer_id?: string
          status?: 'pending' | 'approved'
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          student_id: string
          applied_at: string
          status: string
        }
        Insert: {
          id?: string
          job_id: string
          student_id: string
          applied_at?: string
          status?: string
        }
        Update: {
          id?: string
          job_id?: string
          student_id?: string
          applied_at?: string
          status?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          conversation_id: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          conversation_id: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          conversation_id?: string
        }
      }
    }
  }
}