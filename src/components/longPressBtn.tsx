import React, { useState, useEffect, useRef } from 'react';

interface IInputProps{
  idSuffix?: string,
  min?: number,
  max?: number,
  step?: number,
  name?: string,
  value?: number,
  disabled?: boolean,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>)=>void,
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>)=>void,
}

enum EBtnActionType {
  Plus = 'plus',
  Minus = 'minus',
}

const defaultInterval = 1024;

export default function CustomInputNumber({
  idSuffix,
  min,
  max,
  step=1,
  name,
  value,
  disabled=false,
  onChange,
  onBlur,
}:IInputProps){
  const inputId = idSuffix ? `custom-input-number-${idSuffix}`: 'custom-input-number';
  const [diff, setDiff] = useState<number>(value ?? (max && min && max===min? max: 0));
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled || !!(max && min && max===min));
  const timer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const intervalRef = useRef<number>(defaultInterval);

  const validators = (diff: number): number =>{
    if(max && (diff+diff)>= max){
      return (max-diff);
    }else if(min && (diff-diff)<= min){
      return (diff-min);
    }else{
      return diff;
    }
  }

  const repeatlyClick=(type: EBtnActionType)=>{

    let difference = 0;
    switch(type){
      case EBtnActionType.Plus:
        difference += step*1;
        break
      case EBtnActionType.Minus:
        difference -= step*1;
        break
    }
    difference = validators(difference);
    setDiff(pre=> pre+difference);
    intervalRef.current = intervalRef.current/2;
  }

  const handleBtnMouseDown = (type: EBtnActionType)=>{
    if(isDisabled){
      return
    }
    repeatlyClick(type);
    timer.current = setTimeout(()=>
      handleBtnMouseDown(type),
    intervalRef.current);
  }

  const handleBtnUnClick = ()=>{
    if(timer?.current) {
      clearTimeout(timer.current);
    }
    intervalRef.current = defaultInterval;
  }


  useEffect(()=>{
  }, [diff])

  return(
    <div className="custom-input-number">
      <label
        className={`action-btn minus`}
        htmlFor={inputId}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Minus)}
      />
    </div>
  )
}