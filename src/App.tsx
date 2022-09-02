import RoomAllocation from "./components/roomAllocation";
import CustomInputNumber from "./components/customInputNumber";
import { TRoomMemberCount } from "./components/oneRoom";
import './style/index.scss';

export default function App (){
  const handleChange = (result: TRoomMemberCount[])=>{
    console.log('result', result);
  }

  const handleInputChange = (e: any)=>{
    console.log(`Change: name=${e.target.name}, value=${e.target.value},`);
  }

  const handleInputBlur = (e: any)=>{
    console.log(`Blur: name=${e.target.name}, value=${e.target.value},`);
  }

  return (
    <>
      <RoomAllocation
        guest={10}
        room={3}
        onChange={handleChange}
      />
      <CustomInputNumber
        name="NameStr"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />
    </>
  );
};
