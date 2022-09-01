import React, { useState, useMemo, useEffect } from "react";
import OneRoom, { ERoomMember, TRoomMemberCount } from "./oneRoom";

const PEOPLE_PER_ROOM = 4;

const roomMemberList = [
  {
    label: '大人',
    key: ERoomMember.Adult,
    description: '年齡20+',
    min: 1,
  },
  {
    label: '小孩',
    key: ERoomMember.Child,
    min: 0,
  },
]

type TRoomAllocation = {
  guest: number,
  room: number,
  onChange: (result: TRoomMemberCount[])=>void
}

export default function RoomAllocation ({ guest, room, onChange }: TRoomAllocation){
  const [allocated, setAllocated] = useState<number>(0);
  const [currentValueArr, setCurrentValueArr] = useState<TRoomMemberCount[]>([]);
  const roomCountArr = useMemo<number[]>(()=>{
    let arr = [];
    for(let i=0; i<room; i++){
      arr.push(i);
    }
    return arr
  }, [room])

  const handleCountChange = (value: TRoomMemberCount, idx: number)=>{
    setCurrentValueArr(pre=>([
      ...pre.slice(0, idx),
      value,
      ...pre.slice(idx + 1),
    ]))
  }

  useEffect(()=>{
    setAllocated(()=>{
      let sum = 0;
      for(let i=0; i<currentValueArr.length; i++){
        const values = Object.values(currentValueArr[i])
        sum += values.reduce((acc, cur) => acc + cur, 0);
      }
      return sum
    })
    onChange(currentValueArr);
  }, [currentValueArr, setAllocated])

  useEffect(()=>{
    console.log(`Main Change: ${guest-allocated}`)
  }, [allocated])

  return (
    <>
      <div className="room-allocation">
        <div className="title">
          {`住客人數: ${guest}人/${room}房`}
        </div>
        <div className="sub-title">
          {`尚未分配人數 ${guest-allocated}人`}
        </div>
        <ul>
          {guest>=room? roomCountArr.map((el, idx)=>(
            <li key={el}>
              <OneRoom
                roomMemberList={roomMemberList}
                max={PEOPLE_PER_ROOM}
                unAllocated={guest-allocated}
                allocated={allocated}
                idSuffix={idx}
                disabled={guest<=room ?? false}
                onChange={handleCountChange}
              />
            </li>
          )):
            <li className="error-number">房間數大於人數</li>
          }
        </ul>
      </div>
    </>
  );
};
