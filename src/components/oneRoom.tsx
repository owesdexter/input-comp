import React, { useState, useMemo, useEffect } from "react";
import CustomInputNumber from "./customInputNumber";

export enum ERoomMember{
  Adult = 'adult',
  Child = 'child',
}

export type TRoomMemberCount = {
  [key in ERoomMember]: number
}

type TRoomMemberInfo = {
  label: string,
  key: ERoomMember,
  description?: string,
  min?: number,
  defaultValue?: number
}

type TOneRoomProps = {
  roomMemberList: TRoomMemberInfo[],
  max: number
  idSuffix?: string | number,
  disabled?: boolean,
  disablePlus?: boolean,
  disableMinus?: boolean,
  onChange: (value: TRoomMemberCount, idx: number)=>void
}

export default function OneRoom ({
  idSuffix,
  roomMemberList,
  disabled=false,
  disablePlus=false,
  disableMinus=false,
  max,
  onChange
}: TOneRoomProps){

  const [currentValue, setCurrentValue] = useState<TRoomMemberCount>(()=>{
    let obj = {} as TRoomMemberCount;
    for(let i=0; i<roomMemberList.length; i++){
      let result = (roomMemberList[i].defaultValue)?? (roomMemberList[i].min ?? 0);
      const key = roomMemberList[i].key;
      obj[key] = result;
    }
    return obj;
  });

  const [currentMax, setCurrentMax] = useState<TRoomMemberCount>(()=>{
    let obj = {} as TRoomMemberCount;
    for(let i=0; i<roomMemberList.length; i++){
      const key = roomMemberList[i].key;
      obj[key] = 0;
    }
    return obj;
  });

  const totalMemberCount = useMemo<number>(()=>{
    if(!currentValue){
      return 0
    }
    const values = Object.values(currentValue);
    if(values?.length){
      return values.reduce((acc, cur)=>acc+cur, 0);
    }else{
      return 0
    }
  }, [currentValue])

  const handleMemberCountChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const value = parseInt(e.target.value);
    const name = e.target.name;

    setCurrentValue(pre=>{
      return({
        ...pre,
        [name]: value
      })
    })
  }

  const testConsole = ()=>{
    console.log('currentMax', currentMax);
    console.log('currentValue', currentValue);
  }

  useEffect(()=>{
    let obj = {} as TRoomMemberCount;
    for(const [key, value] of Object.entries(currentValue)){
      let keyE = key as ERoomMember;
      obj[keyE] = value + (max - totalMemberCount);
    }
    setCurrentMax(obj);
  }, [currentValue])

  useEffect(()=>{
    if(typeof idSuffix === 'string'){
      onChange(currentValue, parseInt(idSuffix ?? 0));

    }else{
      onChange(currentValue, idSuffix ?? 0);
    }
  }, [currentValue])

  return (
    <div className="one-room">
      <div className="title">{`房間: ${totalMemberCount}人`}</div>
      <ul className="room-member-list">
        {roomMemberList.map(el=>(
          <li className="member-row" key={`${idSuffix}-${el.key}`}>
            <div>
              <div className="label" onClick={testConsole}>{el.label}</div>
              {el.description?<div className="description">{el.description}</div>: null}
            </div>
            <div>
              <CustomInputNumber
                idSuffix={`${idSuffix}-${el.key}`}
                name={el.key}
                min={el.min}
                max={currentMax[el.key]}
                step={1}
                disabled={disabled}
                disablePlus={disablePlus}
                disableMinus={disableMinus}
                onChange={handleMemberCountChange}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
