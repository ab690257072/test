// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import axios from 'axios'
import store from './store/store'
import 'iview/dist/styles/iview.css'
import './assets/css/common.css'
import { deepCopy, msgHandler } from 'libs'

Vue.use(iView)
Vue.prototype.$http = axios

Vue.config.productionTip = false
axios.defaults.timeout = 60000

// 回顶部
Vue.prototype.$goTop = () => {
  // document.querySelector('.main-ct').scrollTop = 0;
  window.scrollTo(0)
};

// dom加载完成钩子优化（由于webpack插件加载样式方式影响，目前用延迟解决）
Vue.mixin({
	methods: {
		$ready(fn) {
			if (process.env.NODE_ENV === 'production') {
				return this.$nextTick(fn);
			}
			setTimeout(() => {
				this.$nextTick(fn);
			}, 1000);
		}
	},
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
