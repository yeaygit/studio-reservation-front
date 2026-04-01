import SelectBox from './SelectBox'

const createYearOptions = (startYear, endYear) => {
  const minimumYear = Math.min(startYear, endYear)
  const maximumYear = Math.max(startYear, endYear)

  return Array.from({ length: maximumYear - minimumYear + 1 }, (_, index) => {
    const year = maximumYear - index

    return {
      value: String(year),
      label: `${year}년`,
    }
  })
}

const YearSelect = ({
  label = '조회 연도',
  name = 'year',
  value,
  onChange,
  startYear,
  endYear,
  pastRange = 2,
  futureRange = 3,
  ...rest
}) => {
  const currentYear = new Date().getFullYear()
  const resolvedStartYear = startYear ?? currentYear - pastRange
  const resolvedEndYear = endYear ?? currentYear + futureRange
  const options = createYearOptions(resolvedStartYear, resolvedEndYear)

  return (
    <SelectBox
      label={label}
      name={name}
      value={value}
      options={options}
      onChange={onChange}
      {...rest}
    />
  )
}

export default YearSelect
