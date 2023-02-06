module.exports = app => ({
  localStringify (object) {
    return JSON.stringify(object, function (k, v) {
      if (v instanceof RegExp) {
        return v.toString();
      }
      return v;
    })
  },
})
