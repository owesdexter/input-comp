import React, { useState, useEffect, useRef, useCallback } from 'react';

interface IInputEventTarget extends EventTarget{
  name: string;
  value: string;
}

interface IInputClickEvent extends React.MouseEvent<HTMLInputElement, MouseEvent>{
  target: IInputEventTarget;
}

export type IEventUnion = IInputClickEvent |
React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement> | null;

interface IInputProps{
  idSuffix?: string | number,
  min?: number,
  max?: number,
  step?: number,
  name?: string,
  value?: number,
  disabled?: boolean,
  // onChange?: (e: React.ChangeEvent<HTMLInputElement>)=>void,
  // onBlur?: (e: React.ChangeEvent<HTMLInputElement>)=>void,
  onChange?: (e: any)=>void,
  onBlur?: (e: any)=>void,
}

enum EBtnActionType {
  Plus = 'plus',
  Minus = 'minus',
}

enum EInputValueStatus {
  Max = 'max',
  Min = 'min',
  Normal = '',
}

const defaultInterval = 1024;

export default function CustomInputNumber({
  idSuffix,
  min=-5,
  max=5,
  step=1,
  name,
  value,
  disabled=false,
  onChange,
  onBlur,
}:IInputProps){
  const inputId = idSuffix ? `custom-input-number-${idSuffix}`: 'custom-input-number';
  const [inputValue, setInputValue] = useState<string>(value ? `${value}`: `${min? min: 0}`);
  const [isFocus, setIsFoucs] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled || !!(max && min && max===min));
  const [inputValueStatus, setInputValueStatus] = useState<EInputValueStatus>(
    typeof min !== 'undefined'? EInputValueStatus.Min: EInputValueStatus.Normal
  );
  const [event, setEvent] = useState<any>({
    target: {
      value: value ? `${value}`: `${min? min: 0}`,
      name: name ? `${name}`: `${inputId}`,
    }
  });
  const btnTimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const Modifytimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const intervalRef = useRef<number>(defaultInterval);

  const callOnChange = (value: string) =>{
    if(event?.target){
      const targetObj = event.target;
      if(targetObj.value){
        targetObj.value = value;
      }

      const newEvent = {...event, targetObj};
      setEvent(newEvent);
      onChange?.(newEvent);
    }
  }

  const validators = (diff: number): number =>{
    const currentInt = isNaN(parseInt(inputValue)) || !inputValue? 0: parseInt(inputValue);
    if(max && (currentInt + diff)>= max){
      return (max-currentInt);
    }else if(typeof min !=='undefined' && (currentInt + diff)<= min){
      return (min<=0? min-currentInt: currentInt-min);
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
    setInputValue(pre=> {
      const newValue = isNaN(parseInt(pre)) || !pre? 0: parseInt(pre);
      return `${newValue + diff}`
    });
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

  const modifyInputValue = useCallback(()=>{
    const newValue = parseInt(inputValue);
    let result = '';

    if(typeof max !=='undefined' && (newValue>= max)){
      setInputValueStatus(EInputValueStatus.Max);
      result = `${max}`;
    }else if(typeof min !=='undefined' && (newValue<= min)){
      setInputValueStatus(EInputValueStatus.Min);
      result = `${min? min: 0}`;
    }else if(isNaN(newValue)){
      setInputValueStatus(EInputValueStatus.Min);
      result = `${min? min: 0}`;
    }

    if(result){
      setInputValue(result);
      callOnChange(result);

    }else{
      setInputValueStatus(EInputValueStatus.Normal);
      callOnChange(inputValue);
    }
  }, [inputValue])

  const callModifyFn = useCallback(()=>{
    if(Modifytimer?.current) {
      clearTimeout(Modifytimer.current);
    }
    if(!isFocus){
      modifyInputValue();

    }else{
      Modifytimer.current = setTimeout(()=>
        modifyInputValue()
      , 800);
    }
  }, [inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    let newValue = parseInt(e.target.value);
    if(e.target.value.startsWith('-')){

    }else if(/\D/.test(e.target.value)){
      console.log(`${e.target.value} is not Number`);
      setInputValue(`${min? min: 0}`);
      return
    }

    if(!newValue || isNaN(newValue)){
      if(isNaN(newValue)){
        console.log(`isNaN: ${isNaN(newValue)}; undefined: ${!newValue}`);
      }
      callModifyFn();
    }
    setInputValue(e.target.value);
    if(!event._reactName){
      setEvent(e);
    }
  }

  const handleNumberFocus=(e: React.FocusEvent<HTMLInputElement>)=>{
    setIsFoucs(true);
    if(!event._reactName){
      setEvent(e);
    }
  }

  const handleNumberBlur=(e: React.FocusEvent<HTMLInputElement>)=>{
    setIsFoucs(false);
    onBlur?.(e);
    if(!event._reactName){
      setEvent(e);
    }
  }

  const handleInputClick=(e: IInputClickEvent | React.MouseEvent<HTMLInputElement, MouseEvent>)=>{
    if(!event._reactName){
      setEvent(e);
    }
  }

  useEffect(()=>{
    callModifyFn();
  }, [inputValue, callModifyFn])

  return(
    <div className={`custom-input-number${isDisabled? ` disabled`: ''}`}>
      <label
        className={`action-btn minus${inputValueStatus===EInputValueStatus.Min || isDisabled? ` disabled`: ''}`}
        htmlFor={inputId}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Minus)}
      />
      <label htmlFor="number-displayer" className={`number-displayer-container${isFocus? ` focus`: ''}${isDisabled? ` disabled`: ''}`}>
        <input
          value={inputValue}
          type="text"
          id={inputId}
          name={name ?? inputId}
          data-test-id={inputId}
          disabled={isDisabled}
          className="number-displayer"
          onClick={e=>handleInputClick(e)}
          onChange={handleInputChange}
          onBlur={handleNumberBlur}
          onFocus={handleNumberFocus}
        />
      </label>
      <label
        className={`action-btn plus${inputValueStatus===EInputValueStatus.Max || isDisabled? ` disabled`: ''}`}
        htmlFor={inputId}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Plus)}
      />
    </div>
  )
}