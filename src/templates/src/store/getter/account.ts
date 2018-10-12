export default {
    getUserInfo(state: any) {
        return state.profile.profile;
    },
    getAccount(state: any) {
        return state.profile.account;
    }
};
