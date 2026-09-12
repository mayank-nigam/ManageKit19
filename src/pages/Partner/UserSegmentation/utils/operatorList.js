// Operator definitions per field data type, mirroring the legacy page's _operatorList
// (jsUserSegment.js CB-4) with one deliberate fix: the legacy list only defined
// operators for 'BIGINT', even though its value-input switch had an explicit 'INT'
// case (business-rules bug B-8) - any INT field there would silently get zero operator
// options. INT and BIGINT share the same numeric comparison set here.
const TEXT_OPERATORS = [
  { value: 'contain', label: 'Contain' },
  { value: 'not-contain', label: "Doesn't Contain" },
  { value: 'begin-with', label: 'Begin With' },
  { value: 'not-begin-with', label: "Doesn't Begin With" },
  { value: 'end-with', label: 'End With' },
  { value: 'not-end-with', label: "Doesn't End With" },
  { value: 'equal', label: 'Equal To' },
  { value: 'not-equal', label: "Doesn't Equal To" },
];

const NUMERIC_OPERATORS = [
  { value: 'eq', label: 'Equal To (=)' },
  { value: 'gte', label: 'Greater Than or Equal (>=)' },
  { value: 'lte', label: 'Less Than or Equal (<=)' },
  { value: 'gt', label: 'Greater Than (>)' },
  { value: 'lt', label: 'Less Than (<)' },
  { value: 'neq', label: 'Not Equal To (<>)' },
];

export const OPERATORS_BY_TYPE = {
  VARCHAR: TEXT_OPERATORS,
  NVARCHAR: TEXT_OPERATORS,
  BIGINT: NUMERIC_OPERATORS,
  INT: NUMERIC_OPERATORS,
  DATETIME: NUMERIC_OPERATORS,
};

export function operatorsFor(dataType) {
  return OPERATORS_BY_TYPE[dataType] || [];
}
