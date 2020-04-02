class Mvue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.el;
        this.$options = options;
        if(this.$el){
            new Compile(this.$el,this)
        }
    }
}
class Compile{
    constructor(el,vm){
        this.el = this.isElementNode(el) ?el :document.querySelector(el);
        this.vm = vm;
        // 获取文档碎片对象，放入内存中会减少页面的回流和重绘
        const fragment = this.node2Fragment(this.el);
        console.log(fragment);
        //2.追加子元素到跟元素
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
    node2Fragment(el){
        const f = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            f.appendChild(firstChild);
        }
        return f;
    }

}