class Observer {
  constructor(data) {
    this.observe(data);
  }
  observe(data) {
    if (data && typeof data === "object") {
      // console.log(Object.keys(data));
      Object.keys(data).forEach((key) => {
        // console.log("sssssssssssss", data[key]);
        this.defineReactive(data, key, data[key]);
        console.log(data);
      });
    }
  }
  defineReactive(obj, key, value) {
    //递归遍历
    this.observe(value);
    const dep = new Dep();
    // 劫持并且监听所有的属性
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        // 订阅数据变化时，往Dep中添加观察者
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newVal) => {
        this.observe(newVal);
        if (newVal !== value) {
          value = newVal;
        }
        // 告诉Dep通知变化
        dep.notify();
      },
    });
  }
}

// Dep收集观察者
class Dep {
  constructor() {
    this.subs = [];
  }
  // 收集观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知观察者去更新
  notify() {
    console.log("通知了观察者", this.subs);
    this.subs.forEach((w) => w.update());
  }
}

class watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 先存入旧值
    this.oldVal = this.getOldVal();
  }
  getOldVal() {
    Dep.target = this;
    const oldVal = complieUtil.getVal(this.expr, this.vm);
    Dep.target = null;
    return oldVal;
  }
  update() {
    const newVal = complieUtil.getVal(this.expr, this.vm);
    if (newVal !== this.oldVal) {
      this.cb(newVal);
    }
  }
}
