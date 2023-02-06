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
          return new properties[property](ctx)
        }
      })
    }
  }
}
module.exports = MapClass
