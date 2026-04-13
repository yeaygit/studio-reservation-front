import type { ChangeEventHandler, InputHTMLAttributes } from 'react'
import styles from '../../styles/FormComponent.module.css'

interface DateProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string
  hint?: string
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
  hintClassName?: string
  name?: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

const DatePicker = ({
  label,
  hint,
  containerClassName,
  labelClassName,
  inputClassName,
  hintClassName,
  name,
  value,
  onChange,
  ...rest
}: DateProps) => {
  // 기본 Form 스타일과 호출부 전달 클래스를 합쳐 일관된 입력 UI를 만든다.
  const containerClassNames = [styles.field, containerClassName].filter(Boolean).join(' ')
  const labelClassNames = [styles.label, labelClassName].filter(Boolean).join(' ')
  const inputClassNames = [styles.input, inputClassName].filter(Boolean).join(' ')

  return (
    <label className={containerClassNames}>
      {label && <span className={labelClassNames}>{label}</span>}
      <input
        className={inputClassNames}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
      />
      {hint && <span className={hintClassName}>{hint}</span>}
    </label>
  )
}

export default DatePicker
