import CONFIG from '@/config/index';
import t from './tools';

interface IAnyObject {
    [key: string]: any;
}

function showLoading (options = {}) {
    wx.showLoading(Object.assign({
        title: '加载中',
        mask: 'true'
    }, options));
}

function showToast (options = {}) {
    wx.showToast(Object.assign({
        title: '成功',
        mask: 'true',
        icon: 'success',
        duration: 1000
    }, options));
}

function showModal (options = {}) {
    wx.showModal(Object.assign({}, {
        title: '提示',
        content: '',
        cancelColor: CONFIG.THEME.disabledColor,
        confirmColor: CONFIG.THEME.mainColor
    }, options));
}

function navigateTo ({ url }: any, data: IAnyObject): Promise<any> {
    return t.wxPromise(wx.navigateTo)(t.getUrlQuery(url, data));
}

function redirectTo ({ url }: any, data: IAnyObject): Promise<any> {
    return t.wxPromise(wx.redirectTo)(t.getUrlQuery(url, data));
}

function switchTab ({ url }: any, data: IAnyObject): Promise<any> {
    return t.wxPromise(wx.switchTab)(t.getUrlQuery(url, data));
}

function reLaunch ({ url }: any, data: IAnyObject): Promise<any> {
    return t.wxPromise(wx.reLaunch)(t.getUrlQuery(url, data));
}

/**
 * wx API 二次封装
 * 建议要使用到的 wx API 统一走这份文件，方便处理
 * 1. 兼容性问题
 * 2. 设置默认参数
 *
 * 二次封裝的 wx API 统一改为 Promise
 */
const wxApis: IAnyObject = {
    showLoading,
    showToast,
    showModal,
    navigateTo,
    redirectTo,
    switchTab,
    reLaunch,
    hideLoading: wx.hideLoading,
    hideToast: wx.hideToast,
    navigateBack: wx.navigateBack,
    previewImage: wx.previewImage,
    chooseImage: wx.chooseImage,
    getImageInfo: wx.getImageInfo,
    canvasToTempFilePath: wx.canvasToTempFilePath,
    saveImageToPhotosAlbum: wx.saveImageToPhotosAlbum,
    downloadFile: wx.downloadFile,
    requestPayment: wx.requestPayment,
    request: wx.request,
    login: wx.login,
    getSetting: wx.getSetting,
    makePhoneCall: wx.makePhoneCall,
    getNetworkType: wx.getNetworkType,
    setEnableDebug: wx.setEnableDebug,
    showTabBar: wx.showTabBar,
    hideTabBar: wx.hideTabBar,
    createSelectorQuery: wx.createSelectorQuery,
    stopPullDownRefresh: wx.stopPullDownRefresh,
    getSystemInfoSync: wx.getSystemInfoSync,
    uploadFile: wx.uploadFile,
    setStorageSync: wx.setStorageSync,
    getStorageSync: wx.getStorageSync,
    getStorage: wx.getStorage,
    setStorage: wx.setStorage,
    removeStorage: wx.removeStorage,
    removeStorageSync: wx.removeStorageSync,
    onNetworkStatusChange: wx.onNetworkStatusChange,
    getShareInfo: wx.getShareInfo,
};

const DONT_NEED_PROMISEFY: any = [
    'navigateTo',
    'redirectTo',
    'switchTab',
    'reLaunch'
];

Object.keys(wxApis).forEach(key => {
    if (!~DONT_NEED_PROMISEFY.indexOf(key)) {
        wxApis[key] = t.wxPromise(wxApis[key]);
    }
});

export default wxApis;
