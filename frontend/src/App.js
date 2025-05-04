import './App.css';
import Login from './components/login';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.js";

function App() {
     return (
          <div>
               {/* <Login /> */}
               <RouterProvider router={router} />
          </div>
     );
}

export default App;
