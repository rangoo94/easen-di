const expect = require('expect.js')
const DiContainer = require('../src')

const NODE_ENV = process.env.NODE_ENV

describe('EasenDI', () => {
  let di

  beforeEach(() => {
    di = new DiContainer()
  })

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV
  })

  it('should create DI container instance', () => {
    expect(di).to.be.an('object')
  })

  it('should disallow creating factory when it\'s not a function', () => {
    expect(() => di.factory('name', 'not a function')).to.throwError()
  })

  it('should throw error when getting unknown service', () => {
    expect(() => di.get('service')).to.throwError()
  })

  it('should create factory in container', () => {
    di.factory('service', () => 'something')

    expect(di.get('service')).to.be('something')
  })

  it('should register service', () => {
    di.register('service', 'something')

    expect(di.get('service')).to.be('something')
  })

  it('should get all registered dependencies', () => {
    expect(Object.keys(di.getter)).to.eql([])

    di.register('service', 'something')

    expect(Object.keys(di.getter)).to.eql([ 'service' ])
    expect(di.getter.hasOwnProperty('service')).to.be.ok()

    di.register('service2', 'something2')
    expect(Object.keys(di.getter)).to.eql([ 'service', 'service2' ])
    expect(di.getter.hasOwnProperty('service2')).to.be.ok()

    di.factory('service3', () => 'something3')
    expect(Object.keys(di.getter)).to.eql([ 'service', 'service2', 'service3' ])
    expect(di.getter.hasOwnProperty('service3')).to.be.ok()
  })

  it('should not allow updating DI getter', () => {
    expect(() => {
      di.getter.x = 'something'
    }).to.throwError()

    di.register('service', 'something')
    expect(() => delete di.getter.service).to.throwError()

    expect(() => Object.preventExtensions(di.getter)).to.throwError()

    expect(() => Object.setPrototypeOf(di.getter, Number)).to.throwError()
  })

  it('should get service properly by DI getter', () => {
    expect(() => di.getter.unknownService).to.throwError()

    di.register('service', 'something')
    expect(di.getter.service).to.equal('something')

    di.factory('service2', () => 'something2')
    expect(di.getter.service2).to.equal('something2')
  })

  it('should check in DI getter if service exists', () => {
    expect('service' in di.getter).not.to.be.ok()

    di.register('service', 'something')
    expect('service' in di.getter).to.be.ok()
  })

  it('should allow service dependent on other', () => {
    di.register('constant', 'something')
    di.factory('service2', ({ constant }) => constant + '2')

    expect(di.get('service2')).to.equal('something2')
  })

  it('should detect & disallow circular dependency', () => {
    di.factory('constant', ({ constant2 }) => constant2 + 'something')
    di.factory('constant2', ({ constant }) => constant + '2')

    expect(() => di.get('constant')).to.throwError()
  })

  it('should detect that service with error is not accessed again', () => {
    di.factory('error', () => {
      throw new Error('some error')
    })

    expect(() => di.get('error')).to.throwException(/some error/)
    expect(() => di.get('error')).to.throwException(/some error/)
    expect(di.accessStack).to.eql([])
  })

  it('should correctly show stack for circular dependency in development mode', () => {
    di.factory('constant', ({ constant2 }) => constant2 + 'something')
    di.factory('constant2', ({ constant }) => constant + '2')

    process.env.NODE_ENV = 'development'

    expect(() => di.get('constant')).to.throwException(/\|constant -> constant2 -> constant\|/)
    expect(() => di.get('constant2')).to.throwException(/\|constant2 -> constant -> constant2\|/)
  })

  it('should not show stack for circular dependency in production mode', () => {
    di.factory('constant', ({ constant2 }) => constant2 + 'something')
    di.factory('constant2', ({ constant }) => constant + '2')

    process.env.NODE_ENV = 'production'

    expect(() => di.get('constant')).not.to.throwException(/\|constant -> constant2 -> constant\|/)
    expect(() => di.get('constant')).to.throwException(/\|constant\|/)
  })
})
