export const FORMATION_ROWS = ['front', 'back'];
export const FORMATION_COLUMNS = 2;

export function createEmptyFormation() {
  return FORMATION_ROWS.reduce((acc, rowKey) => {
    acc[rowKey] = Array.from({ length: FORMATION_COLUMNS }, () => null);
    return acc;
  }, {});
}

export function cloneFormation(formation) {
  if (!formation || typeof formation !== 'object') {
    return createEmptyFormation();
  }

  const clone = createEmptyFormation();

  FORMATION_ROWS.forEach((rowKey) => {
    const row = Array.isArray(formation[rowKey]) ? formation[rowKey] : [];
    clone[rowKey] = row.slice(0, FORMATION_COLUMNS).map((slot) => (slot ? { ...slot } : null));
  });

  return clone;
}

export function formationHasUnits(formation) {
  if (!formation || typeof formation !== 'object') {
    return false;
  }

  return FORMATION_ROWS.some((rowKey) => {
    const row = formation[rowKey];
    return Array.isArray(row) && row.some((slot) => slot != null);
  });
}

export function assignUnitsToFormation(units = [], options = {}) {
  const {
    mutate = false,
    defaultRows = ['front', 'front', 'back', 'back'],
  } = options;

  const workingUnits = mutate ? units : units.map((unit) => (unit ? { ...unit } : unit));
  const formation = createEmptyFormation();
  const normalizedDefaults = Array.isArray(defaultRows) && defaultRows.length > 0
    ? defaultRows
    : FORMATION_ROWS;

  workingUnits.forEach((unit, index) => {
    if (!unit) {
      return;
    }

    const fallbackRow = normalizedDefaults[Math.min(index, normalizedDefaults.length - 1)] ?? 'back';
    const desiredRow = sanitizeRow(unit.battleRow, fallbackRow);
    const explicitColumn = Number.isInteger(unit.battleColumn)
      ? clampColumn(unit.battleColumn)
      : null;

    const placement = reserveSlot(formation, desiredRow, explicitColumn, fallbackRow);
    const assignedUnit = mutate ? unit : workingUnits[index];

    assignedUnit.battleRow = placement.row;
    assignedUnit.battleColumn = placement.column;
    formation[placement.row][placement.column] = assignedUnit;
  });

  return { formation, units: workingUnits };
}

export function normalizeFormationStructure(input, { mapUnit } = {}) {
  const formation = createEmptyFormation();

  if (!input || typeof input !== 'object') {
    return { formation };
  }

  const source = input.rows && typeof input.rows === 'object'
    ? input.rows
    : input;

  FORMATION_ROWS.forEach((rowKey) => {
    const row = Array.isArray(source[rowKey]) ? source[rowKey] : [];

    row.slice(0, FORMATION_COLUMNS).forEach((unitLike, columnIndex) => {
      if (unitLike && typeof unitLike === 'object') {
        const mapped = mapUnit ? mapUnit(unitLike, rowKey, columnIndex) : { ...unitLike };

        if (mapped) {
          mapped.battleRow = rowKey;
          mapped.battleColumn = columnIndex;
          formation[rowKey][columnIndex] = mapped;
        }
      }
    });
  });

  return { formation };
}

function sanitizeRow(row, fallback) {
  if (FORMATION_ROWS.includes(row)) {
    return row;
  }

  if (FORMATION_ROWS.includes(fallback)) {
    return fallback;
  }

  return FORMATION_ROWS[FORMATION_ROWS.length - 1];
}

function clampColumn(column) {
  return Math.min(Math.max(column, 0), FORMATION_COLUMNS - 1);
}

function reserveSlot(formation, row, explicitColumn, fallbackRow) {
  const rowKey = sanitizeRow(row, fallbackRow);
  const rowSlots = formation[rowKey];

  if (explicitColumn != null && rowSlots[explicitColumn] == null) {
    return { row: rowKey, column: explicitColumn };
  }

  if (explicitColumn != null && rowSlots[explicitColumn] != null) {
    const alternativeColumn = rowSlots.findIndex((slot) => slot == null);
    if (alternativeColumn !== -1) {
      return { row: rowKey, column: alternativeColumn };
    }
  }

  if (explicitColumn == null) {
    const availableColumn = rowSlots.findIndex((slot) => slot == null);
    if (availableColumn !== -1) {
      return { row: rowKey, column: availableColumn };
    }
  }

  const alternativeRow = FORMATION_ROWS.find((candidate) => {
    if (candidate === rowKey) {
      return false;
    }

    return formation[candidate].some((slot) => slot == null);
  });

  if (alternativeRow) {
    const alternativeColumn = formation[alternativeRow].findIndex((slot) => slot == null);
    if (alternativeColumn !== -1) {
      return { row: alternativeRow, column: alternativeColumn };
    }
  }

  const fallbackColumn = explicitColumn != null
    ? clampColumn(explicitColumn)
    : rowSlots.length - 1;

  return { row: rowKey, column: fallbackColumn };
}
