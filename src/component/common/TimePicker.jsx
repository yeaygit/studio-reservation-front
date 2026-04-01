import styles from '../../styles/FormComponent.module.css'

const TimePicker = ({ label, name, value, onChange, ...rest }) => {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
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
