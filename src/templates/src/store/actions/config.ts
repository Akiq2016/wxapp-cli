import router from '@/config/route';

export default {
    detectNetwork() {
        const self: any = getApp() || this;

        self.wxApi.getNetworkType({
            success: (res: any) => {
              self.commit('networkStatus', res);
            }
        });

        wx.onNetworkStatusChange((res: any) => {
            self.commit('networkStatus', res);
        });
    }
};
