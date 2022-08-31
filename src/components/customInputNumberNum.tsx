import React, { useState, useEffect, useRef, useCallback } from 'react';

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

enum EInputValueStatus {
  Max = 'max',
  Min = 'min',
}

const defaultInterval = 1024;

export default function CustomInputNumber({
  idSuffix,
  min=0,
  max=50,
  step=1,
  name,
  value,
  disabled=false,
  onChange,
  onBlur,
}:IInputProps){
  const inputId = idSuffix ? `custom-input-number-${idSuffix}`: 'custom-input-number';
  const [inputValue, setInputValue] = useState<number>(value ?? min);
  const [isFocus, setIsFoucs] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled || !!(max && min && max===min));
  const [inputValueStatus, setInputValueStatus] = useState<string>('');
  const [interval, setInterval] = useState<number>(1024);
  // const [timer, setTimer] = useState<ReturnType<typeof setTimeout>| null>(null);
  const btnTimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const Modifytimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const intervalRef = useRef<number>(defaultInterval);

  const validators = (diff: number): number =>{
    if(max && (inputValue+diff)>= max){
      return (max-diff);
    }else if(min && (inputValue+diff)<= min){
      return (inputValue-min);
    }else{
      return diff;
    }
  }

  const repeatlyClick=(type: EBtnActionType)=>{
    let diff = 0;
    switch(type){
      case EBtnActionType.Plus:
        diff += step*1;
        break
      case EBtnActionType.Minus:
        diff -= step*1;
        break
    }
    diff = validators(diff);
    setInputValue(pre=> pre+diff);
    intervalRef.current = intervalRef.current<=50? 50: intervalRef.current/2;
  }

  const handleBtnMouseDown = (type: EBtnActionType)=>{
    if(isDisabled){
      return
    }
    repeatlyClick(type);
    btnTimer.current = setTimeout(()=>
      handleBtnMouseDown(type),
    intervalRef.current);
  }

  const handleBtnUnClick = ()=>{
    if(btnTimer?.current) {
      clearTimeout(btnTimer.current);
    }
    intervalRef.current = defaultInterval;
  }

  const handleInputKeyup=(e: React.KeyboardEvent<HTMLInputElement>)=>{
    console.log(`key: ${e.key}`)

  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const newValue = parseInt(e.target.value);
    if(Modifytimer?.current) {
      clearTimeout(Modifytimer.current);
    }
    if(!newValue || isNaN(newValue)){
      if(isNaN(newValue)){
        console.log(" isNaN ");
      }
      if(!newValue){
        console.log(" Undefined ");
      }
      Modifytimer.current = setTimeout(() =>
        setInputValue(min)
      , 500)
    }
    setInputValue(parseInt(e.target.value));
    // if(/\d+/){
    //   setInputValue(parseInt(e.target.value));
    // }else{
    //   setInputValue(e.target.value);
    // }

    // let diff = parseInt(e.target.value) - inputValue;
    // if(!isNaN(diff)){
    //   diff = validators(diff);
    //   onChange?.(e);
    //   setInputValue(pre=> pre + diff);
    // }
  }

  const handleNumberBlur=(e: React.ChangeEvent<HTMLInputElement>)=>{
    console.log('Blur', `${e.target.name} = ${e.target.value}`)
    setIsFoucs(false);
    onBlur?.(e);
  }

  const handleNumberFocus=(e: React.ChangeEvent<HTMLInputElement>)=>{
    setIsFoucs(true);
  }

  const modifyInputValue = useCallback(()=>{
    if(max && inputValue> max){
      setInputValueStatus(EInputValueStatus.Max);
      setInputValue(max);

    }else if(min && inputValue< min){
      setInputValueStatus(EInputValueStatus.Min);
      setInputValue(min);
    }else{
      setInputValueStatus('');
    }
  }, [inputValue])

  useEffect(()=>{
    if(Modifytimer?.current) {
      clearTimeout(Modifytimer.current);
    }
    Modifytimer.current = setTimeout(()=>
      modifyInputValue()
    , 600);
    // if(max && inputValue> max){
    //   setInputValueStatus(EInputValueStatus.Max);
    //   setInputValue(max);

    // }else if(min && inputValue< min){
    //   setInputValueStatus(EInputValueStatus.Min);
    //   setInputValue(min);
    // }else{
    //   setInputValueStatus('');
    // }
    // console.log(`newValue: ${inputValue}`)
    // clearTimeout()
  }, [modifyInputValue])

  return(
    <div className="custom-input-number">
      <label
        className={`action-btn minus`}
        htmlFor={inputId}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Minus)}
      />
      <label htmlFor="number-displayer" className={`number-displayer-container${isFocus? ` focus`: ''}${isDisabled? ` disabled`: ''}`}>
        <input
          value={inputValue}
          type="number"
          id={inputId}
          name={name ?? inputId}
          data-test-id={inputId}
          disabled={isDisabled}
          className="number-displayer"
          onKeyUp={handleInputKeyup}
          onChange={handleInputChange}
          onBlur={handleNumberBlur}
          onFocus={handleNumberFocus}
        />
      </label>
      <label
        className={`action-btn plus`}
        htmlFor={inputId}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Plus)}
      />
    </div>
  )
}