import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import 'antd/dist/antd.css';

import { BrowserRouter } from "react-router-dom";

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
<BrowserRouter>
    <App />
</BrowserRouter>);

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
