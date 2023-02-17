class StackClass {
  // 模拟栈数据结构
  constructor() {
    this.items = []
  }

  /**
   * 向栈压入一个元素
   * @param element
   * @returns {number}
   */
  push (element) {
    return this.items.push(element)
  }

  /**
   * 从栈中弹出一个元素
   * @returns {*}
   */
  pop () {
    return this.items.pop()
  }

  /**
   * 获取栈顶元素
   * @returns {*}
   */
  peek () {
    return this.items[this.items.length - 1]
  }

  /**
   * 栈是否为空
   * @returns {boolean}
   */
  isEmpty () {
    return this.items.length === 0
  }

  /**
   * 获取栈长度
   * @returns {number}
   */
  getSize () {
    return this.items.length
  }
}
module.exports = StackClass
