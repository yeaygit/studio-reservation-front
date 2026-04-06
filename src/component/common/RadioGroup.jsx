import styles from '../../styles/FormComponent.module.css'

const RadioGroup = ({ label, name, value, options, onChange }) => {
  const isCompact = options.every((option) => !option.description?.trim())
  const fieldsetClassName = isCompact
    ? `${styles.radioFieldset} ${styles.radioFieldsetCompact}`
    : styles.radioFieldset
  const groupClassName = isCompact ? styles.radioGroupCompact : styles.radioGroup
  const optionClassName = isCompact ? styles.radioOptionCompact : styles.radioOption

  return (
    <div className={fieldsetClassName}>
      {label && <legend className={styles.radioLegend}>{label}</legend>}
      <div className={groupClassName}>
        {options.map((option) => {
          return (
            <label key={option.value} className={optionClassName}>
              <input
                className={styles.radioInput}
                type="radio"
                name={name}
                value={option.value}
                checked={String(value) === String(option.value)}
                onChange={onChange}
              />
              <span className={styles.radioContent}>
                <span className={styles.radioTopRow}>
                  <span className={styles.radioIndicator} aria-hidden="true" />
                  <span className={styles.radioText}>{option.label}</span>
                </span>
                {option.description && (
                  <span className={styles.radioDescription}>{option.description}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default RadioGroup
