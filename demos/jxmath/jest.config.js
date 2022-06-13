// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  coverageThreshold: {
    global: {
      branches: 95, // 分支覆盖率, 是不是每个if代码块都执行了
      functions: 95, // 函数覆盖率, 是不是每个函数都调用了
      lines: 95, // 行覆盖率, 是不是每一行都执行了
      statements: 95 // 语句覆盖率, 是不是每个语句都执行了
    }
  }
}
