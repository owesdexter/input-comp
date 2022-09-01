import React, { useState, useEffect, useRef, useCallback } from 'react';

interface IInputEventTarget extends EventTarget{
  name: string;
  value: string;
}

interface IInputClickEvent extends React.MouseEvent<HTMLInputElement, MouseEvent>{
  target: IInputEventTarget;
}

export type IEventUnion = IInputClickEvent |
React.ChangeEvent<HTMLInputElement> |
React.FocusEvent<HTMLInputElement> |
null;

interface IInputProps{
  idSuffix?: string | number,
  min?: number,
  max?: number,
  step?: number,
  name?: string,
  value?: number,
  restCount?: number,
  minCount?: number,
  disabled?: boolean,
  disablePlus?: boolean,
  disableMinus?: boolean,
  customCompClassName?: string,
  onChange?: (e?: any)=>void,
  onBlur?: (e?: any)=>void,
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
  restCount,
  minCount,
  disablePlus=false,
  disableMinus=false,
  customCompClassName,
  onChange,
  onBlur,
}:IInputProps){
  const inputId = idSuffix ? `custom-input-number-${idSuffix}`: 'custom-input-number';
  const [inputValue, setInputValue] = useState<string>(value ? `${value}`: `${min? min: 0}`);
  const [isFocus, setIsFoucs] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled || !!(max && min && max===min));
  const [isMax, setIsMax] = useState<boolean>(false);
  const [isMin, setIsMin] = useState<boolean>(false);
  const [event, setEvent] = useState<any>({
    target: {
      value: value ? `${value}`: `${min? min: 0}`,
      name: name ? `${name}`: `${inputId}`,
    }
  });
  const btnTimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const Modifytimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const intervalRef = useRef<number>(defaultInterval);

  const callParentChangeFn = (value: string) => {
    if(event?.target){
      const targetObj = event.target;
      if(targetObj.value){
        targetObj.value = value;
      }

      const newEvent = {...event, targetObj};
      updateEvent(newEvent, true);
      onChange?.(newEvent);
    }
  }

  const validators = (type?: EBtnActionType): boolean => {

    if(isDisabled ||
      (isMax && type === EBtnActionType.Plus) ||
      (isMin && type === EBtnActionType.Minus)
    ){
      return false
    }else{
      return true
    }
  }

  const getDifference = (diff: number): number => {
    const currentInt = isNaN(parseInt(inputValue)) || !inputValue? 0: parseInt(inputValue);

    if(max && (currentInt + diff)>= max){
      return (max-currentInt);
    }else if(typeof min !=='undefined' && (currentInt + diff)< min){
      return (min<=0? min-currentInt: currentInt-min);
    }else{
      return diff;
    }
  }

  const handleLongPress = (type: EBtnActionType) => {
    let diff = 0;
    switch(type){
      case EBtnActionType.Plus:
        diff += step*1;
        break
      case EBtnActionType.Minus:
        diff -= step*1;
        break
    }
    diff = getDifference(diff);

    setInputValue(pre=> {
      const newValue = isNaN(parseInt(pre)) || !pre? 0: parseInt(pre);
      return `${newValue + diff}`
    });

    intervalRef.current = intervalRef.current<=50? 50: intervalRef.current/2;
  }

  const clearLongPressTimer = () => {
    if(btnTimer?.current) {
      clearTimeout(btnTimer.current);
    }
  }

  const handleBtnMouseDown = (type: EBtnActionType) => {
    if(!validators(type)){
      return
    }
    handleLongPress(type);
    btnTimer.current = setTimeout(()=>
      handleBtnMouseDown(type),
    intervalRef.current);
  }

  const handleBtnUnClick = () => {
    clearLongPressTimer();
    intervalRef.current = defaultInterval;
  }

  const modifyInputValue = useCallback(()=>{
    const newValue = parseInt(inputValue);
    let result = '';

    if((typeof max !=='undefined' && (newValue>= max))){
      setIsMax(true);
      result = `${max}`;
    }else{
      setIsMax(false);
    }

    if((typeof min !=='undefined' && (newValue<= min))){
      setIsMin(true);
      result = `${min? min: 0}`;
    }else{
      setIsMin(false);
    }

    if(isNaN(newValue)){
      setIsMin(true);
      result = `${min? min: 0}`;
    }

    if(result){
      setInputValue(result);
      callParentChangeFn(result);
      clearLongPressTimer();

    }else{
      callParentChangeFn(inputValue);
    }
  }, [inputValue, max, min])

  const callModifyFn = useCallback(()=>{
    if(Modifytimer?.current) {
      clearTimeout(Modifytimer.current);
    }
    modifyInputValue();
    if(!isFocus){
      modifyInputValue();

    }else{
      Modifytimer.current = setTimeout(()=>
        modifyInputValue()
      , 600);
    }
  }, [inputValue, max, min])

  const updateEvent = (e: IEventUnion | React.MouseEvent<HTMLInputElement, MouseEvent>, force:boolean=false) => {
    if(!event._reactName || force){
      setEvent(e);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    if(isDisabled) {
      return
    }
    let newValue = parseInt(e.target.value);

    if(
      /\D/.test(e.target.value) ||
      (e.target.value.includes('-') && !e.target.value.startsWith('-'))
    ){
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
    updateEvent(e);
  }

  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFoucs(true);
    updateEvent(e);
  }

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFoucs(false);
    onBlur?.(e);
    updateEvent(e);
  }

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    updateEvent(e);
  }

  useEffect(()=>{
    callModifyFn();
  }, [inputValue, max, min, callModifyFn])

  return(
    <div className={`${customCompClassName ?? 'custom-input-number'}${isDisabled? ` disabled`: ''}`}>
      <label
        className={`action-btn minus${isMin || isDisabled? ` disabled`: ''}`}
        htmlFor={inputId}
        data-test-id={`action-btn-minus-${idSuffix}`}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Minus)}
      />
      <label htmlFor={inputId} className={`number-displayer-container${isFocus? ` focus`: ''}${isDisabled? ` disabled`: ''}`}>
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
        className={`action-btn plus${isMax || isDisabled? ` disabled`: ''}`}
        htmlFor={inputId}
        data-test-id={`action-btn-plus-${idSuffix}`}
        onMouseUp={handleBtnUnClick}
        onMouseDown={e=>handleBtnMouseDown(EBtnActionType.Plus)}
      />
    </div>
  )
}