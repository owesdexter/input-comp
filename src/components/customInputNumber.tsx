import React from 'react';

interface IInputProps{
  min: number,
  max: number,
  step: number,
  name: string,
  value: number,
  disabled: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement>)=>void,
  onBlur: (e: React.ChangeEvent<HTMLInputElement>)=>void,
}

export default function CustomInputNumber(){
  return(
    <div className="custom-input-number">
      <div className="btn">

      </div>
      <label htmlFor="number-displayer">
        <input
          type="number"
          id="number-displayer"
          data-test-id="number-displayer"
          className="number-displayer"
        />
      </label>
    </div>
  )
}