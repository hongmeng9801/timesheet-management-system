import { useEffect, useState, useCallback } from 'react'
import { miniProgramBridge, isWechat, isMiniProgram, isMobile } from '../utils/wechat'

/**
 * 微信环境信息接口
 */
interface WechatEnv {
  isWechat: boolean
  isMiniProgram: boolean
  isMobile: boolean
  deviceType: 'ios' | 'android' | 'desktop'
}

/**
 * 用户信息接口
 */
interface UserInfo {
  nickName: string
  avatarUrl: string
  gender: number
  country: string
  province: string
  city: string
  language: string
}

/**
 * 微信小程序通信Hook
 */
export function useWechat() {
  const [env, setEnv] = useState<WechatEnv>({
    isWechat: false,
    isMiniProgram: false,
    isMobile: false,
    deviceType: 'desktop'
  })
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 初始化环境检测
  useEffect(() => {
    const detectEnv = () => {
      const ua = navigator.userAgent.toLowerCase()
      let deviceType: 'ios' | 'android' | 'desktop' = 'desktop'
      
      if (/iphone|ipad|ipod/i.test(ua)) {
        deviceType = 'ios'
      } else if (/android/i.test(ua)) {
        deviceType = 'android'
      }
      
      setEnv({
        isWechat: isWechat(),
        isMiniProgram: isMiniProgram(),
        isMobile: isMobile(),
        deviceType
      })
    }
    
    detectEnv()
  }, [])

  // 获取用户信息
  const getUserInfo = useCallback(async () => {
    if (!env.isMiniProgram) {
      setError('不在小程序环境中')
      return null
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const info = await miniProgramBridge.getUserInfo()
      setUserInfo(info)
      return info
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [env.isMiniProgram])

  // 显示提示消息
  const showToast = useCallback((message: string, icon: 'success' | 'error' | 'loading' = 'success', duration = 2000) => {
    miniProgramBridge.showToast(message, icon, duration)
  }, [])

  // 显示模态对话框
  const showModal = useCallback(async (title: string, content: string, showCancel = true): Promise<boolean> => {
    return await miniProgramBridge.showModal(title, content, showCancel)
  }, [])

  // 返回上一页
  const navigateBack = useCallback(() => {
    miniProgramBridge.navigateBack()
  }, [])

  // 设置页面标题
  const setTitle = useCallback((title: string) => {
    miniProgramBridge.setNavigationBarTitle(title)
  }, [])

  // 分享页面
  const share = useCallback((shareData: {
    title?: string
    desc?: string
    link?: string
    imgUrl?: string
  }) => {
    miniProgramBridge.share(shareData)
  }, [])

  // 向小程序发送消息
  const postMessage = useCallback((data: any) => {
    miniProgramBridge.postMessage(data)
  }, [])

  // 监听小程序消息
  const onMessage = useCallback((type: string, handler: (data: any) => void) => {
    miniProgramBridge.onMessage(type, handler)
    
    // 返回取消监听的函数
    return () => {
      miniProgramBridge.offMessage(type)
    }
  }, [])

  return {
    env,
    userInfo,
    loading,
    error,
    getUserInfo,
    showToast,
    showModal,
    navigateBack,
    setTitle,
    share,
    postMessage,
    onMessage
  }
}

/**
 * 微信支付Hook
 */
export function useWechatPay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = useCallback(async (paymentData: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }) => {
    if (!isWechat()) {
      setError('不在微信环境中，无法使用微信支付')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      return new Promise<boolean>((resolve) => {
        if (window.WeixinJSBridge) {
          window.WeixinJSBridge.invoke('getBrandWCPayRequest', paymentData, (res: any) => {
            if (res.err_msg === 'get_brand_wcpay_request:ok') {
              resolve(true)
            } else {
              setError('支付失败: ' + res.err_msg)
              resolve(false)
            }
          })
        } else {
          setError('微信支付环境未准备好')
          resolve(false)
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '支付过程中发生错误'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    pay
  }
}

/**
 * 微信分享Hook
 */
export function useWechatShare() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isWechat()) {
      setError('不在微信环境中')
      return
    }

    // 检查微信JS-SDK是否可用
    if (window.wx) {
      setIsReady(true)
    } else {
      setError('微信JS-SDK未加载')
    }
  }, [])

  const shareToFriend = useCallback((shareData: {
    title: string
    desc: string
    link: string
    imgUrl?: string
  }) => {
    if (!isReady || !window.wx) {
      setError('微信分享功能未准备好')
      return
    }

    window.wx.updateAppMessageShareData({
      title: shareData.title,
      desc: shareData.desc,
      link: shareData.link,
      imgUrl: shareData.imgUrl || '',
      success: () => {
        console.log('分享到朋友配置成功')
      },
      fail: (err: any) => {
        setError('分享配置失败: ' + err.errMsg)
      }
    })
  }, [isReady])

  const shareToTimeline = useCallback((shareData: {
    title: string
    link: string
    imgUrl?: string
  }) => {
    if (!isReady || !window.wx) {
      setError('微信分享功能未准备好')
      return
    }

    window.wx.updateTimelineShareData({
      title: shareData.title,
      link: shareData.link,
      imgUrl: shareData.imgUrl || '',
      success: () => {
        console.log('分享到朋友圈配置成功')
      },
      fail: (err: any) => {
        setError('分享配置失败: ' + err.errMsg)
      }
    })
  }, [isReady])

  return {
    isReady,
    error,
    shareToFriend,
    shareToTimeline
  }
}

/**
 * 微信定位Hook
 */
export function useWechatLocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = useCallback(async (type: 'wgs84' | 'gcj02' = 'wgs84') => {
    if (!isWechat() || !window.wx) {
      setError('不在微信环境中或JS-SDK未加载')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      return new Promise<{
        latitude: number
        longitude: number
        speed: number
        accuracy: number
      } | null>((resolve) => {
        window.wx.getLocation({
          type: type,
          success: (res: any) => {
            resolve({
              latitude: res.latitude,
              longitude: res.longitude,
              speed: res.speed,
              accuracy: res.accuracy
            })
          },
          fail: (err: any) => {
            setError('获取位置失败: ' + err.errMsg)
            resolve(null)
          }
        })
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getLocation
  }
}

export default useWechat