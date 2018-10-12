Component({
    properties: {
        // note: 可以直接在组件上通过wx:if 来控制显隐
        // 也可以使用 animationShow 来在组件内控制显隐（含有动画效果）
        animationShow: {
            type: Boolean,
            value: true
        },
    },
    methods: {
        close() {
            this.triggerEvent('onClose', true);
        }
    }
});
