import React from "react";
import CustomInputNumber from "./components/customInputNumber";
import './style/index.scss';

// const App: React.FC<{}> = () => {
//   return (
//     <>
//       <CustomInputNumber
//         onChange={}
//       />
//       <input type="number" name="" id="" />
//     </>
//   );
// };

// export default App;
export default function App (){
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    console.log(`Change! name: ${e.target.name},  value: ${e.target.value}`);
    // console.log(e);
  }

  const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>)=>{
    console.log(`Blur! name: ${e.target.name} value: ${e.target.value}`);
  }

  return (
    <>
      <CustomInputNumber
        onChange={handleOnChange}
        onBlur={handleOnBlur}
      />
      {/* <input type="number" name="" id="" /> */}
    </>
  );
};
