import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建带有重试机制的Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 重试机制包装函数
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`操作失败，第 ${attempt} 次尝试:`, error)
      
      if (attempt === maxRetries) {
        break
      }
      
      // 指数退避延迟
      const waitTime = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError!
}

// 检查网络连接
export async function checkNetworkConnection(): Promise<boolean> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (error) {
        throw new Error(`数据库连接失败: ${error.message}`)
      }
      
      return data
    }, 2, 500)
    
    return true
  } catch (error) {
    console.error('网络连接检查失败:', error)
    return false
  }
}

// 安全的数据库查询包装函数
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    return await withRetry(queryFn, 2, 500)
  } catch (error) {
    console.error('数据库查询失败:', error)
    return {
      data: null,
      error: {
        message: '网络连接异常，请检查网络设置或稍后重试',
        code: 'NETWORK_ERROR',
        details: error
      }
    }
  }
}

// Database types
export interface Company {
  id: string
  name: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  phone: string
  password_hash: string
  id_card: string
  name: string
  company_id: string
  department_id?: string
  role_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Auth types
export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  phone: string
  password: string
  id_card: string
  name: string
  company_id: string
  role_id: string
}

export interface ResetPasswordData {
  id_card: string
  new_password: string
}

// Permission categories interface
export interface PermissionCategory {
  category: string
  display_name: string
  description?: string
  sort_order: number
  created_at: string
}