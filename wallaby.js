module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js'
    ],
    tests: [
      'tests/**/*Spec.js'
    ],

    env: {
      type: 'node'
    },

    testFramework: 'mocha'
  }
}
