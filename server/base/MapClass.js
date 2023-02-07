const is = require('is-type-of');
class MapClass {
  constructor(options) {
    const { ctx, properties } = options
    for (const property in properties) {
      if(!properties.hasOwnProperty(property)){
        continue
      }
      Object.defineProperty(this, property,{
        get() {
          if(!is.class(properties[property])){
            throw new Error(`${property}不是一个Class类`)
          }
          // 原理：通过劫持this.service的getter函数，去new一个class，把上下文保存为类属性，
          // 所以每次调用service时都可以获取到最新的上下文
          return new properties[property](ctx)
        }
      })
    }
  }
}
module.exports = MapClass
