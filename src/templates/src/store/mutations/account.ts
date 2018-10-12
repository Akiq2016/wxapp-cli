export default {
    login(state: any, action: any = {}): any {
        if (Object.keys(action).length) {
            state.profile = action;
            wx.setStorageSync('PROFILE', action);
        }
        return state;
    },
};
