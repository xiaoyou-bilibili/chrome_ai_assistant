import ReactDOM from 'react-dom'
import App from './App'
import './content.css'

window.onload = async () => {
    // 插入脚本
    const el = document.querySelector('body');
    if (el) {
      el.insertAdjacentHTML(
        'afterend',
        '<div id="crx-app"></div>',
      );
      ReactDOM.render(<App />, document.getElementById('crx-app') as HTMLElement);
    }
}
  