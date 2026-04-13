import type { ChangeEventHandler, SelectHTMLAttributes } from 'react'
import styles from '../../styles/FormComponent.module.css'

interface SelectOption {
  label: string | number
  value: string | number
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string
  name?: string
  value: string | number
  options: SelectOption[]
  onChange: ChangeEventHandler<HTMLSelectElement>
}

const SelectBox = ({ label, name, value, options, onChange, ...rest } : SelectProps) => {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <select
        className={styles.select}
        name={name}
        value={value}
        onChange={onChange}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectBox
