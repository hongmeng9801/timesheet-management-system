/**
 * 加载组件
 * 提供统一的加载状态显示和管理
 */

Component({
  properties: {
    // 是否显示加载
    show: {
      type: Boolean,
      value: false
    },
    // 加载文本
    text: {
      type: String,
      value: '加载中...'
    },
    // 加载类型：spinner, dots, pulse
    type: {
      type: String,
      value: 'spinner'
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      value: true
    },
    // 遮罩透明度
    maskOpacity: {
      type: Number,
      value: 0.7
    },
    // 加载图标大小
    size: {
      type: String,
      value: 'medium' // small, medium, large
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    },
    // 是否延迟显示（避免闪烁）
    delay: {
      type: Number,
      value: 300
    }
  },

  data: {
    visible: false,
    delayTimer: null
  },

  observers: {
    'show': function(show) {
      this.handleShowChange(show);
    }
  },

  methods: {
    handleShowChange(show) {
      if (show) {
        // 延迟显示，避免快速加载时的闪烁
        if (this.data.delay > 0) {
          const timer = setTimeout(() => {
            this.setData({ visible: true });
          }, this.data.delay);
          this.setData({ delayTimer: timer });
        } else {
          this.setData({ visible: true });
        }
      } else {
        // 立即隐藏
        if (this.data.delayTimer) {
          clearTimeout(this.data.delayTimer);
          this.setData({ delayTimer: null });
        }
        this.setData({ visible: false });
      }
    },

    // 点击遮罩
    onMaskTap() {
      // 可以在这里添加点击遮罩的处理逻辑
      this.triggerEvent('masktap');
    },

    // 获取加载图标类名
    getIconClass() {
      const { type, size } = this.data;
      return `loading-icon loading-${type} loading-${size}`;
    }
  },

  lifetimes: {
    detached() {
      // 组件销毁时清理定时器
      if (this.data.delayTimer) {
        clearTimeout(this.data.delayTimer);
      }
    }
  }
});