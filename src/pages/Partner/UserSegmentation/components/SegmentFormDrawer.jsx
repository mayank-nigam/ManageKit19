import React, { useState, useEffect } from 'react';
import { Drawer, Input, Select, Radio, DatePicker, InputNumber, Button } from 'antd';
import { Plus, Minus } from 'lucide-react';
import Swal from 'sweetalert2';
import { mockFields } from '../mockData/mockSegmentsData';
import { operatorsFor } from '../utils/operatorList';

const emptyEntry = { fieldName: null, operatorValue: null, value: null };

const SegmentFormDrawer = ({ open, segment, onClose, onSave }) => {
  const isEdit = Boolean(segment?.id);

  const [name, setName] = useState('');
  const [logicalOperator, setLogicalOperator] = useState('and');
  const [conditions, setConditions] = useState([]);
  const [entry, setEntry] = useState(emptyEntry);
  const [entryError, setEntryError] = useState('');
  const [nameError, setNameError] = useState('');
  const [conditionsError, setConditionsError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(segment?.name || '');
      setLogicalOperator(segment?.logicalOperator || 'and');
      setConditions(segment?.conditions ? [...segment.conditions] : []);
      setEntry(emptyEntry);
      setEntryError('');
      setNameError('');
      setConditionsError('');
    }
  }, [open, segment]);

  const selectedField = mockFields.find((f) => f.name === entry.fieldName);
  const operatorOptions = selectedField ? operatorsFor(selectedField.dataType) : [];
  // Real fix for the legacy no-operators-available fallback: the value/operator
  // controls are genuinely disabled here (business rules B-5 - the legacy's
  // .prop('disalbed', true) typo meant they stayed clickable despite being empty).
  const hasNoOperators = Boolean(selectedField) && operatorOptions.length === 0;

  const handleAddCondition = () => {
    if (!entry.fieldName) return setEntryError('Select a field');
    if (!entry.operatorValue) return setEntryError('Select an operator');
    if (entry.value === null || entry.value === undefined || entry.value === '') {
      return setEntryError('Enter a value');
    }

    const operator = operatorOptions.find((o) => o.value === entry.operatorValue);
    const valueStr = selectedField.dataType === 'DATETIME' ? entry.value.format('D-M-YYYY') : String(entry.value);

    const duplicate = conditions.some(
      (c) => c.fieldName === entry.fieldName && c.operatorValue === entry.operatorValue && c.value === valueStr
    );
    if (duplicate) return setEntryError('This exact condition has already been added');

    setConditions((prev) => [
      ...prev,
      {
        fieldName: entry.fieldName,
        fieldLabel: selectedField.label,
        operatorValue: entry.operatorValue,
        operatorLabel: operator.label,
        value: valueStr,
      },
    ]);
    setEntry(emptyEntry);
    setEntryError('');
    setConditionsError('');
  };

  const handleRemoveCondition = (index) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('Segment name is required');
      hasError = true;
    } else {
      setNameError('');
    }
    if (conditions.length === 0) {
      setConditionsError('Add at least one condition');
      hasError = true;
    } else {
      setConditionsError('');
    }
    if (hasError) return;

    setSaving(true);
    const res = await onSave({
      id: segment?.id,
      name: name.trim(),
      logicalOperator,
      conditions,
    });
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to save segment.', 'error');
    }
  };

  const renderValueInput = () => {
    if (!selectedField || hasNoOperators) {
      return <Input disabled placeholder="Select a field first" />;
    }
    if (selectedField.dataType === 'DATETIME') {
      return (
        <DatePicker
          value={entry.value}
          onChange={(v) => { setEntry((e) => ({ ...e, value: v })); setEntryError(''); }}
          format="D-M-YYYY"
          style={{ width: '100%' }}
        />
      );
    }
    if (selectedField.dataType === 'INT' || selectedField.dataType === 'BIGINT') {
      return (
        <InputNumber
          value={entry.value}
          onChange={(v) => { setEntry((e) => ({ ...e, value: v })); setEntryError(''); }}
          style={{ width: '100%' }}
          placeholder="Enter"
        />
      );
    }
    return (
      <Input
        value={entry.value || ''}
        onChange={(e) => { setEntry((s) => ({ ...s, value: e.target.value })); setEntryError(''); }}
        placeholder="Enter"
      />
    );
  };

  return (
    <Drawer
      title={isEdit ? 'Edit User Segmentation' : 'Add User Segmentation'}
      open={open}
      onClose={onClose}
      width={560}
      className="user-segmentation-drawer"
      footer={
        <div className="flex justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" className="bg-green-600 hover:bg-green-700 border-green-600" loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name</label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            placeholder="Enter segment name"
            status={nameError ? 'error' : ''}
          />
          {nameError && <div className="text-xs text-red-500 mt-1">{nameError}</div>}
        </div>

        <Radio.Group value={logicalOperator} onChange={(e) => setLogicalOperator(e.target.value)} className="flex flex-col gap-2">
          <Radio value="and">Apply all of these Conditions</Radio>
          <Radio value="or">Apply any of these Conditions</Radio>
        </Radio.Group>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Condition</label>
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
            <Select
              placeholder="Field"
              value={entry.fieldName}
              onChange={(v) => { setEntry({ fieldName: v, operatorValue: null, value: null }); setEntryError(''); }}
              options={mockFields.map((f) => ({ label: f.label, value: f.name }))}
            />
            <Select
              placeholder="Operator"
              value={entry.operatorValue}
              disabled={!selectedField || hasNoOperators}
              onChange={(v) => { setEntry((e) => ({ ...e, operatorValue: v })); setEntryError(''); }}
              options={operatorOptions.map((o) => ({ label: o.label, value: o.value }))}
            />
            {renderValueInput()}
            <Button
              icon={<Plus size={14} />}
              onClick={handleAddCondition}
              disabled={!selectedField || hasNoOperators}
            />
          </div>
          {hasNoOperators && (
            <div className="text-xs text-amber-600 mt-1">No operators available for this field's data type.</div>
          )}
          {entryError && <div className="text-xs text-red-500 mt-1">{entryError}</div>}
        </div>

        <div>
          {conditionsError && <div className="text-xs text-red-500 mb-2">{conditionsError}</div>}
          {conditions.length === 0 ? (
            <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg py-6 text-center">
              No conditions added yet.
            </div>
          ) : (
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {conditions.map((c, i) => (
                <div
                  key={`${c.fieldName}-${c.operatorValue}-${c.value}-${i}`}
                  className="flex items-center justify-between px-3 py-2 text-sm border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-700">
                    <span className="font-medium">{c.fieldLabel}</span>{' '}
                    <span className="text-gray-400">{c.operatorLabel}</span>{' '}
                    <span className="font-medium">{c.value}</span>
                  </span>
                  <button type="button" onClick={() => handleRemoveCondition(i)} className="text-red-500 hover:text-red-600 p-1">
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default SegmentFormDrawer;
