const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const isString = (val) => {
    return typeof val === 'string';
};
const isArray = (val) => {
    return Array.isArray(val);
};
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const targetMap = new Map();
const trigger = (target, key) => {
    const targetDep = targetMap.get(target);
    const deps = targetDep.get(key);
    triggerEffect(deps);
};
const triggerEffect = (deps) => {
    for (const dep of deps) {
        if (dep.scheduler) {
            dep.scheduler();
        }
        else {
            dep.run();
        }
    }
};

function createGetter(isReadonly = false, shallow = false) {
    return (target, key) => {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value);
        // 依赖触发trigger
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const reactiveHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key: ${key} set Error, because target is readonly`);
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGet });

function createReactiveObject(target, handler) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, handler);
}
const reactive = (row) => {
    return createReactiveObject(row, reactiveHandler);
};
const readonly = (row) => {
    return createReactiveObject(row, readonlyHandler);
};
const shallowReadonly = (row) => {
    return createReactiveObject(row, shallowReadonlyHandler);
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    '$el': (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        el: null,
        proxy: null,
        setupState: {},
        render: () => { },
        props: {},
    };
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // TODO:
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO:
    // function
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    instance.render = component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props } = vnode;
    const el = vnode.el = document.createElement(type);
    setElementProps(el, props);
    setElementChildren(vnode, el, children);
    container.append(el);
}
function setElementProps(el, props) {
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            const isOn = (name) => /^on[A-Z]/.test(name);
            if (isOn(key)) {
                const event = key.slice(2).toLocaleLowerCase();
                el.addEventListener(event, val);
            }
            else {
                el.setAttribute(key, val);
            }
        }
    }
}
function setElementChildren(vnode, el, children) {
    if (vnode.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.innerText = children;
    }
    else if (vnode.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        children.forEach(v => patch(v, el));
    }
}
function setupRenderEffect(instance, initialVNode, container) {
    const subTree = instance.render.call(instance.proxy);
    // vnode -> patch
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
const getShapeFlag = (type) => {
    return isString(type) ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
};

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component -> vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
