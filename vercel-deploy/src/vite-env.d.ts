/// <reference types="vite/client" />

// 微信相关全局类型声明
declare global {
  interface Window {
    wx?: {
      config: (config: any) => void;
      ready: (callback: () => void) => void;
      error: (callback: (res: any) => void) => void;
      updateAppMessageShareData: (config: any) => void;
      updateTimelineShareData: (config: any) => void;
      getLocation: (config: any) => void;
      scanQRCode: (config: any) => void;
      chooseImage: (config: any) => void;
      uploadImage: (config: any) => void;
      downloadImage: (config: any) => void;
      previewImage: (config: any) => void;
      miniProgram?: {
        navigateTo: (config: any) => void;
        postMessage: (config: any) => void;
        switchTab: (config: any) => void;
        reLaunch: (config: any) => void;
        redirectTo: (config: any) => void;
        navigateBack: (config?: any) => void;
        getEnv: (callback: (res: any) => void) => void;
      };
    };
    WeixinJSBridge?: {
      invoke: (method: string, params: any, callback: (res: any) => void) => void;
      on: (event: string, callback: (res: any) => void) => void;
      call: (method: string, params?: any) => void;
    };
    __wxjs_environment?: string;
    miniProgramUtils?: {
      postMessage: (data: any) => void;
      navigateBack: () => void;
      getEnv: (callback: (res: any) => void) => void;
    };
  }
}

export {};