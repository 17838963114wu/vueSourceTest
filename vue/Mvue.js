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
        this.compile(fragment);
        //3.追加子元素到跟元素
        this.el.appendChild(fragment);
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
    compile(fragment){
        //获取子节点
        const childNodes =  fragment.childNodes;
        // console.log(childNodes)
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                console.log('元素节点',child)
            }else{
                console.log('文本节点', child)
            }
        })
        if(child.childNodes && child.childNodes.length){
            // 递归，获取跟元素下所有子节点
            this.compile(child);
        }
    }

}