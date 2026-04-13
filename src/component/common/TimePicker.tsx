import type { ChangeEventHandler, InputHTMLAttributes } from 'react'
import styles from '../../styles/FormComponent.module.css'

interface TimeProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string
  name?: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

const TimePicker = ({ label, name, value, onChange, ...rest } : TimeProps) => {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        className={styles.input}
        type="time"
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </label>
  )
}

export default TimePicker
