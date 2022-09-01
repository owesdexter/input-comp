import React from "react";
import RoomAllocation from "./components/roomAllocation";
import CustomInputNumber from "./components/customInputNumber";
import { TRoomMemberCount } from "./components/oneRoom";
import './style/index.scss';

export default function App (){
  const handleChange = (result: TRoomMemberCount[])=>{
    console.log('result', result);
  }

  return (
    <>
      <RoomAllocation
        guest={10}
        room={3}
        onChange={handleChange}
      />
    </>
  );
};
