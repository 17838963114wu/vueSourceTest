class Mvue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;
    if (this.$el) {
      //实现一个数据观察者
      new Observer(this.$data);
      //实现一个指令解析器
      new Compile(this.$el, this);
    }
  }
  // 代理，将this.$data.htmlStr 代理成this.htmlStr
  proxyData(data) {
    for (const key in data) {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        },
      });
    }
  }
}
// 解析指令
class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 获取文档碎片对象，放入内存中会减少页面的回流和重绘
    const fragment = this.node2Fragment(this.el);
    // console.log(fragment);
    this.compile(fragment);
    //3.追加子元素到跟元素
    this.el.appendChild(fragment);
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
  node2Fragment(el) {
    const f = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      f.appendChild(firstChild);
    }
    return f;
  }
  compile(fragment) {
    //获取子节点
    const childNodes = fragment.childNodes;
    // console.log(childNodes)
    [...childNodes].forEach((child) => {
      if (this.isElementNode(child)) {
        // console.log("元素节点", child);
        this.compileElement(child);
      } else {
        // console.log("文本节点", child.textContent);
        this.compileText(child);
      }
      if (child.childNodes && child.childNodes.length) {
        // 递归，获取跟元素下所有子节点
        this.compile(child);
      }
    });
  }
  compileElement(node) {
    const attributes = node.attributes;
    [...attributes].forEach((attr) => {
      // console.log("元素属性", attr);
      const { name, value } = attr;
      if (this.isDirective(name)) {
        //是一个指令 v-text v-html v-model v-on:click
        const [, directive] = name.split("-");
        const [dirName, eventName] = directive.split(":");
        complieUtil[dirName](node, value, this.vm, eventName);

        //删除有指令的标签上的属性
        node.removeAttribute("v-" + directive);
      } else if (this.isEventName(name)) {
        //@click="handleClick"
        let [, eventName] = name.split("@");
        complieUtil["on"](node, value, this.vm, eventName);
      }
    });
  }

  compileText(node) {
    // 处理，并获取html中‘{{}}’符号内容
    const content = node.textContent;
    if (/\{\{(.+?)\}\}/.test(content)) {
      // console.log(content);
      complieUtil["text"](node, content, this.vm);
    }
  }

  isDirective(attrName) {
    return attrName.startsWith("v-");
  }
  isEventName(attrName) {
    return attrName.startsWith("@");
  }
}
const complieUtil = {
  getVal(expr, vm) {
    return expr.split(".").reduce((data, currentVal) => {
      return data[currentVal];
    }, vm.$data);
  },
  setVal(expr, vm, inputVal) {
    return expr.split(".").reduce((data, currentVal) => {
      data[currentVal] = inputVal;
    }, vm.$data);
  },
  getContentVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getVal(args[1], vm);
    });
  },
  text(node, expr, vm) {
    // const value = this.getVal(expr, vm);
    let value;
    console.log("111111111");
    if (expr.indexOf("{{") !== -1) {
      value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        // console.log(args);
        new watcher(vm, args[1], (newVal) => {
          this.updater.textUpdater(node, this.getContentVal(expr, vm));
        });
        return this.getVal(args[1], vm);
      });
    } else {
      console.log("2222222222222");
      new watcher(vm, expr, (newVal) => {
        this.updater.textUpdater(node, newVal);
      });
      value = this.getVal(expr, vm);
    }
    this.updater.textUpdater(node, value);
  },
  html(node, expr, vm) {
    const value = vm.$data[expr];
    new watcher(vm, expr, (newVal) => {
      this.updater.htmlUpdater(node, newVal);
    });
    this.updater.htmlUpdater(node, value);
  },
  model(node, expr, vm) {
    const value = vm.$data[expr];
    // 数据驱动视图
    new watcher(vm, expr, (newVal) => {
      this.updater.modelUpdater(node, newVal);
    });
    // 视图 => 数据 => 视图
    node.addEventListener("input", (e) => {
      // 设置值
      this.setVal(expr, vm, e.target.value);
    });
    this.updater.modelUpdater(node, value);
  },
  on(node, expr, vm, eventName) {
    let fn = vm.$options.methods && vm.$options.methods[expr];
    node.addEventListener(eventName, fn.bind(vm), false);
  },
  // 更新
  updater: {
    textUpdater(node, value) {
      console.log("text---------");
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      console.log("html------");
      node.innerHTML = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    },
  },
};
