# React 中劫持浏览器回退按钮的心得记录

[React-Router History包](https://github.com/remix-run/history/blob/main/docs/api-reference.md#history.listen)

## 需求

> 在B页面点击浏览器回退按钮到A页面时,需要维持之前A页面跳转到B页面时的状态

## 实现

> 在页面 `A,B` 跳转前传入 state 信息, 并且在触发浏览器回退的 `页面B` 加入 `popstate` 监听事件

> 步骤为  1 > 2 > 3 > 4

### 页面 A

```javascript
// 跳转到页面 B
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class PageA extends Component {
  constructor(props) {
    super(props);
    const { location: { state: { className } = {} } = {} } = props;
    this.state = {
      className,
    };
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { location: { pathname, state: { className } = {} } = {}, history } = this.props;
    if (className) {
      history.replace(pathname); // 4 清除state值, PageA CTRL/CMD + R 强制刷新时页面恢复到初始状态
    }
  }

  render() {
    const { className } = this.state
    // 1 带参数 className 跳转到页面B
    return <Link classname={className} to={{ pathname: "/pageb", state: { className: 'actived' } }}>Page B</Link>
  }
}
```

### 页面 B

```javascript
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PageB extends Component {
  constructor(props) {
    super(props);
    const { location: { state } = {} } = props;
    this.state = {
      historyState: state,
    };
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { location: { pathname } = {}, history } = this.props;
    const { historyState } = this.state;
    // window.history.pushState(historyState, null, document.URL); 使用原生操作也可以达到目的, 但是在页面强制刷新的时候会丢掉 state 信息
    history.push(pathname, historyState); // 2 当前页面再次跳转, 在历史堆栈中添加一条记录, 如果不执行, 则无法触发下一行监听事件
    window.addEventListener('popstate', this.handleBrowserHistoryBack, false);
  }

  render() {
    return 'Page B'
  }

  handleBrowserHistoryBack = () => {
    const { historyState } = this.state;
    const { history } = this.props;
    history.push('pagea', historyState); // 3 带着页面A传递过来的参数跳转到页面A
  };
}
```
