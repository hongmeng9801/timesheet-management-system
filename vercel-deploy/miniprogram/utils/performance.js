/**
 * 性能优化工具类
 * 提供页面加载、图片懒加载、数据缓存等性能优化功能
 */

class PerformanceOptimizer {
  constructor() {
    this.imageCache = new Map();
    this.dataCache = new Map();
    this.loadingStates = new Map();
    this.performanceData = {
      pageLoadTimes: {},
      apiResponseTimes: {},
      imageLoadTimes: {},
      memoryUsage: []
    };
  }

  /**
   * 页面性能监控
   */
  startPagePerformance(pageName) {
    const startTime = Date.now();
    this.performanceData.pageLoadTimes[pageName] = {
      startTime,
      endTime: null,
      duration: null
    };
    
    // 监控内存使用
    this.monitorMemoryUsage();
    
    return startTime;
  }

  endPagePerformance(pageName) {
    const endTime = Date.now();
    if (this.performanceData.pageLoadTimes[pageName]) {
      this.performanceData.pageLoadTimes[pageName].endTime = endTime;
      this.performanceData.pageLoadTimes[pageName].duration = 
        endTime - this.performanceData.pageLoadTimes[pageName].startTime;
      
      console.log(`页面 ${pageName} 加载耗时: ${this.performanceData.pageLoadTimes[pageName].duration}ms`);
    }
  }

  /**
   * API请求性能监控
   */
  startApiPerformance(apiName) {
    const startTime = Date.now();
    this.performanceData.apiResponseTimes[apiName] = {
      startTime,
      endTime: null,
      duration: null
    };
    return startTime;
  }

  endApiPerformance(apiName) {
    const endTime = Date.now();
    if (this.performanceData.apiResponseTimes[apiName]) {
      this.performanceData.apiResponseTimes[apiName].endTime = endTime;
      this.performanceData.apiResponseTimes[apiName].duration = 
        endTime - this.performanceData.apiResponseTimes[apiName].startTime;
      
      console.log(`API ${apiName} 响应耗时: ${this.performanceData.apiResponseTimes[apiName].duration}ms`);
    }
  }

  /**
   * 图片懒加载
   */
  lazyLoadImage(imageSrc, callback) {
    // 检查缓存
    if (this.imageCache.has(imageSrc)) {
      callback && callback(this.imageCache.get(imageSrc));
      return;
    }

    // 检查是否正在加载
    if (this.loadingStates.has(imageSrc)) {
      return;
    }

    this.loadingStates.set(imageSrc, true);
    const startTime = Date.now();

    // 预加载图片
    const image = wx.createImage ? wx.createImage() : {};
    
    if (image.onload !== undefined) {
      image.onload = () => {
        const loadTime = Date.now() - startTime;
        this.performanceData.imageLoadTimes[imageSrc] = loadTime;
        this.imageCache.set(imageSrc, imageSrc);
        this.loadingStates.delete(imageSrc);
        callback && callback(imageSrc);
      };

      image.onerror = () => {
        this.loadingStates.delete(imageSrc);
        console.error(`图片加载失败: ${imageSrc}`);
      };

      image.src = imageSrc;
    } else {
      // 小程序环境下直接返回
      this.imageCache.set(imageSrc, imageSrc);
      this.loadingStates.delete(imageSrc);
      callback && callback(imageSrc);
    }
  }

  /**
   * 数据缓存管理
   */
  setCache(key, data, expireTime = 30 * 60 * 1000) { // 默认30分钟过期
    const cacheData = {
      data,
      timestamp: Date.now(),
      expireTime
    };
    
    this.dataCache.set(key, cacheData);
    
    // 同时存储到本地缓存
    try {
      wx.setStorageSync(`cache_${key}`, cacheData);
    } catch (error) {
      console.error('缓存存储失败:', error);
    }
  }

  getCache(key) {
    // 先从内存缓存获取
    let cacheData = this.dataCache.get(key);
    
    // 如果内存中没有，从本地存储获取
    if (!cacheData) {
      try {
        cacheData = wx.getStorageSync(`cache_${key}`);
        if (cacheData) {
          this.dataCache.set(key, cacheData);
        }
      } catch (error) {
        console.error('缓存读取失败:', error);
        return null;
      }
    }

    if (!cacheData) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.expireTime) {
      this.removeCache(key);
      return null;
    }

    return cacheData.data;
  }

  removeCache(key) {
    this.dataCache.delete(key);
    try {
      wx.removeStorageSync(`cache_${key}`);
    } catch (error) {
      console.error('缓存删除失败:', error);
    }
  }

  clearCache() {
    this.dataCache.clear();
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  }

  /**
   * 内存使用监控
   */
  monitorMemoryUsage() {
    if (wx.getPerformance) {
      const performance = wx.getPerformance();
      if (performance.memory) {
        const memoryInfo = {
          timestamp: Date.now(),
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.performanceData.memoryUsage.push(memoryInfo);
        
        // 只保留最近100条记录
        if (this.performanceData.memoryUsage.length > 100) {
          this.performanceData.memoryUsage.shift();
        }
      }
    }
  }

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 页面预加载
   */
  preloadPage(url) {
    try {
      wx.preloadPage && wx.preloadPage({
        url: url
      });
    } catch (error) {
      console.error('页面预加载失败:', error);
    }
  }

  /**
   * 批量数据处理
   */
  batchProcess(dataArray, batchSize = 50, processor) {
    return new Promise((resolve) => {
      let index = 0;
      const results = [];
      
      const processBatch = () => {
        const batch = dataArray.slice(index, index + batchSize);
        if (batch.length === 0) {
          resolve(results);
          return;
        }
        
        const batchResults = batch.map(processor);
        results.push(...batchResults);
        index += batchSize;
        
        // 使用 setTimeout 避免阻塞主线程
        setTimeout(processBatch, 0);
      };
      
      processBatch();
    });
  }

  /**
   * 网络状态优化
   */
  optimizeForNetwork() {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        
        // 根据网络类型调整策略
        switch (networkType) {
          case 'wifi':
            this.setHighQualityMode();
            break;
          case '4g':
            this.setMediumQualityMode();
            break;
          case '3g':
          case '2g':
            this.setLowQualityMode();
            break;
          default:
            this.setMediumQualityMode();
        }
      }
    });
  }

  setHighQualityMode() {
    // 高质量模式：启用所有功能
    this.config = {
      imageQuality: 'high',
      cacheSize: 100,
      preloadEnabled: true,
      animationEnabled: true
    };
  }

  setMediumQualityMode() {
    // 中等质量模式：平衡性能和质量
    this.config = {
      imageQuality: 'medium',
      cacheSize: 50,
      preloadEnabled: true,
      animationEnabled: true
    };
  }

  setLowQualityMode() {
    // 低质量模式：优先性能
    this.config = {
      imageQuality: 'low',
      cacheSize: 20,
      preloadEnabled: false,
      animationEnabled: false
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    return {
      pageLoadTimes: this.performanceData.pageLoadTimes,
      apiResponseTimes: this.performanceData.apiResponseTimes,
      imageLoadTimes: this.performanceData.imageLoadTimes,
      memoryUsage: this.performanceData.memoryUsage,
      cacheStats: {
        imageCacheSize: this.imageCache.size,
        dataCacheSize: this.dataCache.size
      }
    };
  }

  /**
   * 清理性能数据
   */
  clearPerformanceData() {
    this.performanceData = {
      pageLoadTimes: {},
      apiResponseTimes: {},
      imageLoadTimes: {},
      memoryUsage: []
    };
  }
}

// 创建全局实例
const performanceOptimizer = new PerformanceOptimizer();

// 导出实例和类
module.exports = {
  PerformanceOptimizer,
  performanceOptimizer
};