/**
 * Throw error that action is disallowed
 */
const disallow = () => {
  throw new Error('You can\'t update DI from getter.')
}

/**
 * @param {EasenDi} di
 * @returns {Proxy}
 */
function createProxy(di) {
  return new Proxy(di.factories, {
    set: disallow,
    deleteProperty: disallow,
    defineProperty: disallow,
    preventExtensions: disallow,
    setPrototypeOf: disallow,

    // Allow accessing object methods like `hasOwnProperty`, others pass to DI container
    get(target, name) {
      return (!di.factories.hasOwnProperty(name) && di.factories[name]) || di.get(name)
    },

    has(target, key) {
      return di.factories.hasOwnProperty(key)
    }
  })
}

module.exports = createProxy
