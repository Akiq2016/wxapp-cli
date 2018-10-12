import t from '@/utils/tools';

Component({
    options: {
        multipleSlots: true
    },
    properties: {
        multipleSlot: { // 授权按钮和普通按钮下的slot是否使用同一个
            type: Boolean,
            value: false
        },
        hasUserInfo: { // 是否使用授权按钮
            type: Boolean,
            value: false,
        }
    },
    methods: {
        async getUserInfo ({ detail }: WXEventBasic) {
            try {
                if (await t.checkUserInfoAuth()) {
                    await getApp().dispatch('setProfile', detail);
                    this.triggerEvent('hassetprofile', {});
                }
            } catch (error) {
                console.warn('setProfile failed: ', error);
            }
        },

        handleNormalBtnTap () {
            this.triggerEvent('tapnormalbtn', {});
        }
    }
});
