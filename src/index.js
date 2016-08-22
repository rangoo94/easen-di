const createProxy = require('./create-proxy')
const findAlternatives = require('find-alternatives')

/**
 * @var {function} getter
 * @var {object} factories
 * @var {object} cache
 */
class EasenDi {
  constructor() {
    this.factories = {}
    this.cache = {}
    this.getter = createProxy(this)

    if (process.env.NODE_ENV !== 'production') {
      this.accessStack = []
    }
  }

  /**
   * Register factory of dependency
   *
   * @param {string} name
   * @param {function} factory
   */
  factory(name, factory) {
    if (typeof factory !== 'function') {
      throw new TypeError(`Factory must be a function.`)
    }

    this.factories[name] = factory

    delete this.cache[name]
  }

  /**
   * Register service
   *
   * @param {string} name
   * @param {*} service
   */
  register(name, service) {
    return this.factory(name, () => service)
  }

  /**
   * Load dependency
   *
   * @param {string} name
   * @returns {*}
   */
  get(name) {
    if (!this.factories.hasOwnProperty(name)) {
      if (process.env.NODE_ENV !== 'production') {
        const alternatives = findAlternatives(name, Object.keys(this.factories))

        if (alternatives.length) {
          throw new ReferenceError(`Factory |${name}| not found. Did you meant: ${alternatives.join(', ')}?`)
        }
      }
      throw new ReferenceError(`Factory |${name}| not found.`)
    }

    // If this dependency is already accessed, throw circular dependency error
    // Show full stack trace only for development - access stack can slow down application
    if (this.factories[name].accessed) {
      const stack = process.env.NODE_ENV === 'production' ? name : `${this.accessStack.join(' -> ')} -> ${name}`
      throw new Error(`Circular dependency found while accessing |${stack}|.`)
    }

    // Mark dependency as currently accessed
    this.factories[name].accessed = true
    if (process.env.NODE_ENV !== 'production') {
      this.accessStack.push(name)
    }

    // If dependency wasn't built yet - do it
    // We have to catch errors to be sure that we put `accessed` flag down
    let error
    if (!this.cache[name]) {
      try {
        this.cache[name] = this.factories[name](this.getter)
      } catch (e) {
        error = e
      }
    }

    // Mark dependency as not accessed
    this.factories[name].accessed = false
    if (process.env.NODE_ENV !== 'production') {
      this.accessStack.pop()
    }

    // Throw error if happened while building dependency
    if (error) {
      throw error
    }

    return this.cache[name]
  }
}

module.exports = EasenDi
