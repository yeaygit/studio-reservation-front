import styles from '../../styles/FormComponent.module.css'

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
}) => {
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
