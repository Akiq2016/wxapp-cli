const ACTIONS = {}
const MUTATIONS = {}
const GETTER = {}

// 将 state 挂载到 getApp().state
function _setState(state) {
	this.state = Object.assign({}, state)
}

function _setAction(actions) {
	Object.assign(ACTIONS, actions)
}

function _setMutation(mutations) {
	Object.assign(MUTATIONS, mutations)
}

function _setGetter(getter) {
	Object.assign(GETTER, getter)
}

function createStore() {
	let stateModules = require('./state/index.ts')
	let actionModules = require('./actions/index.ts')
	let mutationModules = require('./mutations/index.ts')
	let getterModules = require('./getter/index.ts')

	// has module namespace in getApp().state
	if (stateModules) {
		_setState.call(this, stateModules.default)
	}

	// has module namespace in MUTATIONS
	if (mutationModules) {
		_setMutation(mutationModules.default)
	}

	// has module namespace in ACTIONS
	if (actionModules) {
		_setAction(actionModules.default)
	}

	// has module namespace in GETTER
	if (getterModules) {
		_setGetter(getterModules.default)
	}
}

function dispatch(keyname, param) {
	const currentModuleName = Object.keys(ACTIONS).find(moduleName =>
		ACTIONS[moduleName].hasOwnProperty(keyname))

	if (currentModuleName) {
		const self = getApp() || this
		return ACTIONS[currentModuleName][keyname]
			.call(this, self.state[currentModuleName], param)
	} else {
		console.log(`could not dispatch ${keyname}. ${keyname} callback is undefined.`)
	}
}

function getter(keyname, param) {
	const currentModuleName = Object.keys(GETTER).find(moduleName => GETTER[moduleName].hasOwnProperty(keyname))

	if (currentModuleName) {
		const self = getApp() || this
		return GETTER[currentModuleName][keyname]
			.call(this, self.state[currentModuleName], param)
	} else {
		console.log(`could not dispatch ${keyname}. ${keyname} callback is undefined.`)
	}
}

function commit(keyname, param) {
	const currentModuleName = Object.keys(MUTATIONS).find(moduleName =>
		MUTATIONS[moduleName].hasOwnProperty(keyname))

	if (currentModuleName) {
		const self = getApp() || this
		self.state[currentModuleName] = MUTATIONS[currentModuleName][keyname]
			.call(null, self.state[currentModuleName], param)
	} else {
		console.log(`could not commit ${keyname}. ${keyname} callback is undefined.`)
	}
}

export default {
	commit,
	createStore,
	dispatch,
	getter
}
