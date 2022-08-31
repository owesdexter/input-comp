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
  max=10,
  step=1,
  name,
  value,
  disabled=false,
  onChange,
  onBlur,
}:IInputProps){
  const inputId = idSuffix ? `custom-input-number-${idSuffix}`: 'custom-input-number';
  const [inputValue, setInputValue] = useState<string>(value ? `${value}`: `${min}`);
  const [isFocus, setIsFoucs] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(disabled || !!(max && min && max===min));
  const [inputValueStatus, setInputValueStatus] = useState<string>('');
  const btnTimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const Modifytimer = useRef<ReturnType<typeof setTimeout>| null>(null);
  const intervalRef = useRef<number>(defaultInterval);



  const validators = (diff: number): number =>{
    const currentInt = isNaN(parseInt(inputValue)) || !inputValue? 0: parseInt(inputValue);
    if(max && (currentInt + diff)>= max){
      return (max-currentInt);
    }else if(typeof min !=='undefined' && (currentInt + diff)<= min){
      return (min<0? min-currentInt: currentInt-min);
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
      console.log(`diff: ${diff}`)
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



  const handleNumberBlur=(e: React.ChangeEvent<HTMLInputElement>)=>{
    console.log('Blur', `${e.target.name} = ${e.target.value}`)
    setIsFoucs(false);
    onBlur?.(e);
  }

  const handleNumberFocus=(e: React.ChangeEvent<HTMLInputElement>)=>{
    setIsFoucs(true);
  }

  const modifyInputValue = useCallback(()=>{
    const newValue = parseInt(inputValue);

    if(typeof max !=='undefined' && (newValue> max)){
      setInputValueStatus(EInputValueStatus.Max);
      setInputValue(`${max}`);
    }else if(typeof min !=='undefined' && (newValue< min)){
      setInputValueStatus(EInputValueStatus.Min);
      setInputValue(`${min}`);
    }else if(isNaN(newValue)){
      console.log(`newValue is ${newValue}`)
      setInputValue(`${min}`);
    }
    // onChange?.();
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
      setInputValue(`${min}`);
      return
    }

    if(!newValue || isNaN(newValue)){
      if(isNaN(newValue)){
        console.log(`isNaN: ${isNaN(newValue)}; undefined: ${!newValue}`);
      }
      callModifyFn();
      // Modifytimer.current = setTimeout(() =>
      //   setInputValue(`${min}`)
      //   , 500)
      // }
    }
    setInputValue(e.target.value);
  }

  useEffect(()=>{
    callModifyFn();
  }, [inputValue, callModifyFn])

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
          type="text"
          id={inputId}
          name={name ?? inputId}
          data-test-id={inputId}
          disabled={isDisabled}
          className="number-displayer"
          // onKeyUp={handleInputKeyup}
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